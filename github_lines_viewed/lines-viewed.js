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
  const progressBar = document.querySelector('progress-bar');
  progressBar.setAttribute('ratio', newRatio)
}

function textReplacement() {
  const progressBarText = document.querySelector('progress-bar').children[0].children[0].lastChild;
  progressBarText.data = progressBarText.data.replaceAll('file', 'line');
}

function runScript() {
  let newRatio = getNewRatio();
  updateLinesRead(newRatio);
  textReplacement();
}

const checkboxObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length) {
      runScript();
    }
  });
});

const targetNode = document.querySelector('copilot-diff-entry').parentNode.parentNode;
if (targetNode) {
  checkboxObserver.observe(targetNode, {
    childList: true,
    subtree: true
  });
}

// This only runs on a direct refresh or load of a PR /files URL not if coming
// from a different part of the PR.
runScript();
