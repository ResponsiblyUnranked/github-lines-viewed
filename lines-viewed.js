const PROGRESS_COMPLETE_COLOUR = "#3b8640"
const PROGRESS_INCOMPLETE_COLOUR = "#3c69ba"
const PROGRESS_BAR_WIDTH = "160px"
const PROGRESS_BAR_CLASS_NAME = "gh-lines-viewed-progress-bar"

function getExclusionsList() {
  return browser.runtime.sendMessage({ thing: "content" })
}

function toExclusionRegexes(exclusionsList) {
  // An empty pattern matches every file, so would exclude everything
  return (exclusionsList ?? [])
    .filter((pattern) => pattern !== "")
    .map((pattern) => new RegExp(pattern))
}

function countLines(changedFiles, exclusionRegexes) {
  let totalLinesChanged = 0
  let linesViewed = 0

  changedFiles.forEach((changedFile) => {
    let fileLinesChanged = changedFile.linesChanged

    // Skip binary (BIN) files
    if (isNaN(fileLinesChanged)) {
      fileLinesChanged = 1
    }

    // Skip excluded files
    if (exclusionRegexes.some((r) => r.test(changedFile.filePath))) {
      fileLinesChanged = 1
    }

    // Minimum 1 line changed always
    if (fileLinesChanged === 0) {
      fileLinesChanged = 1
    }

    totalLinesChanged += fileLinesChanged

    if (changedFile.isViewed) {
      linesViewed += fileLinesChanged
    }
  })

  return { linesViewed, totalLinesChanged }
}

function getProgressColour(lineCounts) {
  if (lineCounts.linesViewed === lineCounts.totalLinesChanged) {
    return PROGRESS_COMPLETE_COLOUR
  }

  return PROGRESS_INCOMPLETE_COLOUR
}

function setText(textNode, text) {
  // Only write changes, as every write re-triggers the observer. Editing the
  // existing text node (rather than replacing it) lets GitHub keep updating it.
  if (textNode.data !== text) {
    textNode.data = text
  }
}

const classicLayout = {
  isActive() {
    return document.querySelector("copilot-diff-entry") !== null
  },

  getChangedFiles() {
    const diffEntries = document.querySelectorAll("copilot-diff-entry")

    return [...diffEntries].map((diffEntry) => ({
      filePath: diffEntry.getAttribute("data-file-path"),
      linesChanged: Number(
        diffEntry.querySelector(".diffstat").textContent.replaceAll(",", ""),
      ),
      isViewed: diffEntry
        .querySelector('input[type="checkbox"]')
        .hasAttribute("checked"),
    }))
  },

  showProgress(lineCounts) {
    const progressBar = document.querySelector("progress-bar")
    const newRatio = `${lineCounts.linesViewed} / ${lineCounts.totalLinesChanged}`

    if (progressBar.getAttribute("ratio") !== newRatio) {
      progressBar.setAttribute("ratio", newRatio)
    }

    const progressBarTextRow = progressBar.children[0]
    const progressBarText = progressBarTextRow.children[0].lastChild
    setText(progressBarText, progressBarText.data.replaceAll("file", "line"))

    // GitHub centres the text, so left-align it with the bar instead
    progressBarTextRow.style.setProperty(
      "justify-content",
      "flex-start",
      "important",
    )

    const bar = document.querySelector(
      ".color-bg-accent-emphasis.js-review-progress",
    )

    bar.parentElement.style.setProperty(
      "width",
      PROGRESS_BAR_WIDTH,
      "important",
    )
    bar.style.setProperty(
      "transition",
      "width 0.2s ease-out, background-color 0.3s ease",
    )
    bar.style.setProperty(
      "background-color",
      getProgressColour(lineCounts),
      "important",
    )
  },
}

const newLayout = {
  isActive() {
    return (
      document.querySelector('[data-testid="progressive-diffs-list"]') !== null
    )
  },

  getChangedFiles() {
    const fileHeaders = document.querySelectorAll(
      '[data-testid="progressive-diffs-list"] [class*="diff-file-header__"]',
    )

    return [...fileHeaders].map((fileHeader) => ({
      // GitHub wraps the file path in invisible left-to-right marks
      filePath: fileHeader
        .querySelector("h3")
        .textContent.replaceAll("\u200e", "")
        .trim(),
      linesChanged: sumAdditionsAndDeletions(fileHeader),
      // Markdown files also have a pressable "File view" toggle in the header
      isViewed:
        fileHeader
          .querySelector('button[aria-pressed][aria-label$="viewed" i]')
          .getAttribute("aria-pressed") === "true",
    }))
  },

  showProgress(lineCounts) {
    const progressContainers = document.querySelectorAll(
      '[class*="ProgressContainer__"]',
    )

    progressContainers.forEach((progressContainer) => {
      const [viewedCount, totalCount] = progressContainer.querySelectorAll(
        '[class*="FilesCountText__"]',
      )
      setText(viewedCount.firstChild, String(lineCounts.linesViewed))
      setText(totalCount.firstChild, String(lineCounts.totalLinesChanged))
      setText(
        progressContainer.querySelector('[class*="ViewedText__"]').firstChild,
        "lines viewed",
      )

      const progressIndicator = progressContainer.parentElement
      setText(
        progressIndicator.querySelector(".sr-only").firstChild,
        `${lineCounts.linesViewed} of ${lineCounts.totalLinesChanged} lines viewed`,
      )

      // Replace GitHub's progress circle with a bar
      const progressCircle = progressIndicator.querySelector(
        "svg[data-circumference]",
      )
      progressCircle.style.setProperty("display", "none")

      let progressBar = progressIndicator.querySelector(
        `.${PROGRESS_BAR_CLASS_NAME}`,
      )

      if (progressBar === null) {
        progressBar = createProgressBar()
        progressContainer.after(progressBar)
      }

      stackTextAboveProgressBar(progressIndicator, progressContainer)

      const percentageViewed =
        (lineCounts.linesViewed / lineCounts.totalLinesChanged) * 100
      const progressBarFill = progressBar.firstChild

      progressBarFill.style.setProperty("width", `${percentageViewed}%`)
      progressBarFill.style.setProperty(
        "background-color",
        getProgressColour(lineCounts),
      )
    })
  },
}

function stackTextAboveProgressBar(progressIndicator, progressContainer) {
  // Matches the classic layout. The fixed width stops the bar moving as the
  // text changes length. GitHub's utility classes use "!important" too.
  progressIndicator.style.setProperty("flex-direction", "column", "important")
  progressIndicator.style.setProperty("align-items", "flex-start", "important")
  progressIndicator.style.setProperty("gap", "4px")
  progressIndicator.style.setProperty("width", PROGRESS_BAR_WIDTH)

  progressContainer.style.setProperty("margin-left", "0", "important")
  progressContainer.style.setProperty("white-space", "nowrap")
  progressContainer.style.setProperty("font-size", "12px")
  progressContainer.style.setProperty(
    "color",
    "var(--fgColor-muted, var(--color-fg-muted))",
  )
}

function createProgressBar() {
  const progressBar = document.createElement("span")
  progressBar.classList.add(PROGRESS_BAR_CLASS_NAME)
  progressBar.setAttribute("aria-hidden", "true")
  progressBar.style.setProperty("display", "inline-flex")
  progressBar.style.setProperty("overflow", "hidden")
  progressBar.style.setProperty("width", PROGRESS_BAR_WIDTH)
  progressBar.style.setProperty("height", "8px")
  progressBar.style.setProperty("border-radius", "6px")
  progressBar.style.setProperty(
    "background-color",
    "var(--borderColor-default, var(--color-border-default))",
  )

  const progressBarFill = document.createElement("span")
  progressBarFill.style.setProperty(
    "transition",
    "width 0.2s ease-out, background-color 0.3s ease",
  )

  progressBar.appendChild(progressBarFill)
  return progressBar
}

function sumAdditionsAndDeletions(fileHeader) {
  // Each count is only shown when non-zero, e.g. "+17" and "-1"
  const diffstatCounts = fileHeader.querySelectorAll(
    ".fgColor-success.text-bold, .fgColor-danger.text-bold",
  )

  return [...diffstatCounts].reduce(
    (total, diffstatCount) =>
      total + Number(diffstatCount.textContent.replace(/\D/g, "")),
    0,
  )
}

const layouts = [classicLayout, newLayout]

async function runScript() {
  const activeLayout = layouts.find((layout) => layout.isActive())

  if (activeLayout === undefined) {
    return
  }

  const exclusionRegexes = toExclusionRegexes(await getExclusionsList())
  const changedFiles = activeLayout.getChangedFiles()

  if (changedFiles.length === 0) {
    return
  }

  activeLayout.showProgress(countLines(changedFiles, exclusionRegexes))
}

let isRunScheduled = false

function scheduleRun() {
  if (isRunScheduled) {
    return
  }

  isRunScheduled = true
  requestAnimationFrame(() => {
    isRunScheduled = false
    runScript()
  })
}

// GitHub navigates and marks files as viewed without reloading the page, so
// re-run on DOM changes. Writes are skipped when the value is already shown,
// otherwise this extension's own changes would re-trigger it endlessly.
const observer = new MutationObserver(scheduleRun)
observer.observe(document, {
  subtree: true,
  childList: true,
  characterData: true,
  attributeFilter: ["aria-pressed", "checked"],
})
