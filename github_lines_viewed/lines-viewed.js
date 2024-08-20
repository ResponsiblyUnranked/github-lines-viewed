function getNewRatio() {
  const changedFiles = document.querySelectorAll('copilot-diff-entry');

  let totalLinesChanged = 0;
  let linesViewed = 0;

  changedFiles.forEach(changedFile => {
    let fileLinesChanged = Number(changedFile.querySelector('.diffstat').textContent)
    totalLinesChanged += fileLinesChanged

    let checkbox = changedFile.querySelector('input[type="checkbox"]')
    if (checkbox.hasAttribute('checked')) {
      linesViewed += fileLinesChanged
    }
  })

  return `${linesViewed} / ${totalLinesChanged}`
}

function updateLinesRead(newRatio) {
  console.log(`Updating lines read: ${newRatio}`)
  const progressBar = document.querySelector('progress-bar');
  progressBar.setAttribute('ratio', newRatio)
  progressBar.increment() // Creates an error, but still works
}

// I don't think this ever runs since the progressBar.increment() fails (but works)
function textReplacement() {
    const progressBar = document.querySelector('progress-bar');
    const progressBarText = progressBar.children[0].innerText;
    const newProgressBarText = progressBarText.replaceAll('file', 'line');
    console.log(`newProgressBarText = ${newProgressBarText}`)
    progressBarText.innerText = newProgressBarText
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length) {
      let newRatio = getNewRatio();
      updateLinesRead(newRatio);
      textReplacement();
    }
  });
});

const targetNode = document.querySelector('copilot-diff-entry').parentNode.parentNode;
if (targetNode) {
  observer.observe(targetNode, {
    childList: true,
    subtree: true
  });
}

// This only runs on a direct refresh or load of a PR /files URL not if coming
// from a different part of the PR.
const firstNewRatio = getNewRatio();
updateLinesRead(firstNewRatio);
textReplacement();
