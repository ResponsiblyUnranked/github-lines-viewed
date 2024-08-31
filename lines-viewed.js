function getExclusionsList() {
  return browser.runtime.sendMessage({ thing: "content" })
}

function getNewRatio(exclusionsList) {
  const changedFiles = document.querySelectorAll("copilot-diff-entry")

  if (exclusionsList[0] === "") {
    exclusionsList = []
  }

  const exclusionRegexes = exclusionsList.map((r) => new RegExp(r))

  let totalLinesChanged = 0
  let linesViewed = 0

  changedFiles.forEach((changedFile) => {
    let fileLinesChanged = Number(
      changedFile.querySelector(".diffstat").textContent.replaceAll(",", ""),
    )

    // Skip binary (BIN) files
    if (isNaN(fileLinesChanged)) {
      fileLinesChanged = 1
    }

    // Skip excluded files
    const filePath = changedFile.getAttribute("data-file-path")

    if (exclusionRegexes.some((r) => r.test(filePath))) {
      fileLinesChanged = 1
    }

    // Minimum 1 line changed always
    if (fileLinesChanged === 0) {
      fileLinesChanged = 1
    }

    totalLinesChanged += fileLinesChanged

    let checkbox = changedFile.querySelector('input[type="checkbox"]')
    if (checkbox.hasAttribute("checked")) {
      linesViewed += fileLinesChanged
    }
  })

  return `${linesViewed} / ${totalLinesChanged}`
}

function updateLinesRead(newRatio) {
  const progressBar = document.querySelector("progress-bar")
  progressBar.setAttribute("ratio", newRatio)
}

function textReplacement() {
  const progressBarText =
    document.querySelector("progress-bar").children[0].children[0].lastChild
  progressBarText.data = progressBarText.data.replaceAll("file", "line")
}

function updateBarColour() {
  const bar = document.querySelector(
    ".color-bg-accent-emphasis.js-review-progress",
  )

  bar.style.setProperty(
    "transition",
    "width 0.2s ease-out, background-color 0.3s ease",
  )

  if (bar.style.width === "100%") {
    bar.style.setProperty("background-color", "#3b8640", "important")
  } else {
    bar.style.setProperty("background-color", "#3c69ba", "important")
  }
}

function runScript() {
  let exclusionsListPromise = getExclusionsList()
  exclusionsListPromise.then(getNewRatio).then(updateLinesRead)
  textReplacement()
  updateBarColour()
}

const checkboxObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      runScript()
    }
  })
})

// Run script when URL changes to end with "/files"
let previousUrl = ""
const observer = new MutationObserver(() => {
  const targetNode =
    document.querySelector("copilot-diff-entry")?.parentNode?.parentNode
  if (targetNode) {
    checkboxObserver.observe(targetNode, {
      childList: true,
      subtree: true,
    })

    if (location.href !== previousUrl) {
      previousUrl = location.href

      if (location.href.endsWith("/files")) {
        runScript()
      }
    }
  }
})
observer.observe(document, { subtree: true, childList: true })
