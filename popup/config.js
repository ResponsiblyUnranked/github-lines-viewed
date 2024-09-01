// Create listeners
browser.runtime.onMessage.addListener(sendExclusionsList)

// Enable popovers
const popoverTriggerList = document.querySelectorAll(
  '[data-bs-toggle="popover"]',
)
const popoverList = [...popoverTriggerList].map(
  (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl),
)

// Logic for regex excludes
const editExclusionsButton = document.getElementById("editExclusions")
const insertCommonExclusionsButton = document.getElementById(
  "insertCommonExclusions",
)
const exclusionsTextBox = document.getElementById("exclusionList")
let savedExclusions = localStorage.getItem("gh-lines-viewed-exclusions-list")

if (savedExclusions === null) {
  savedExclusions = []
} else {
  savedExclusions = JSON.parse(savedExclusions)
}

savedExclusions = savedExclusions.join("\n")
exclusionsTextBox.value = savedExclusions

editExclusionsButton.addEventListener("click", function () {
  // Cosmetic Changes
  insertCommonExclusionsButton.disabled = !insertCommonExclusionsButton.disabled
  exclusionsTextBox.disabled = !exclusionsTextBox.disabled

  if (editExclusionsButton.textContent.trim() === "Edit") {
    editExclusionsButton.textContent = "Save"
    editExclusionsButton.classList.add("btn-danger")
    editExclusionsButton.classList.remove("btn-primary")
    insertCommonExclusionsButton.classList.add("btn-primary")
    insertCommonExclusionsButton.classList.remove("btn-secondary")
  } else {
    // Cosmetic Changes
    editExclusionsButton.textContent = "Edit"
    editExclusionsButton.classList.add("btn-primary")
    editExclusionsButton.classList.remove("btn-danger")
    insertCommonExclusionsButton.classList.add("btn-secondary")
    insertCommonExclusionsButton.classList.remove("btn-primary")
  }
  saveExclusions()
})

function saveExclusions() {
  // Save data
  const patternStrings = exclusionsTextBox.value.split("\n")
  const validPatterns = []
  const badPatterns = []
  let badPatternError = ""

  for (let i = 0; i < patternStrings.length; i++) {
    try {
      RegExp(patternStrings[i])
      validPatterns.push(patternStrings[i])
    } catch (error) {
      badPatterns.push(patternStrings[i])
    }
  }

  for (let i = 0; i < badPatterns.length; i++) {
    badPatternError += `<code>${badPatterns[i]}</code><br>`
  }
  const badRegexErrorMessage =
    "The following regex patterns are invalid:<br>" + badPatternError

  const alertPlaceholder = document.getElementById("invalidRegexAlert")
  alertPlaceholder.innerHTML = ""

  if (badPatterns.length > 0) {
    setAlertMessage(badRegexErrorMessage)
  }

  localStorage.setItem(
    "gh-lines-viewed-exclusions-list",
    JSON.stringify(validPatterns),
  )
}

function setAlertMessage(message) {
  const alertPlaceholder = document.getElementById("invalidRegexAlert")
  const wrapper = document.createElement("div")
  wrapper.innerHTML = [
    `<div class="alert alert-danger alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    "</div>",
  ].join("")
  alertPlaceholder.append(wrapper)
}

// Insert Common Exclusions
insertCommonExclusionsButton.addEventListener("click", function () {
  console.log("adding defaults")
  const defaultExclusions = [
    ".*poetry\\.lock$", // Python
    ".*Pipfile\\.lock$", // Python
    ".*pdm\\.lock$", // Python
    ".*pubspec\\.lock$", // Dart
    ".*package-lock\\.json$", //JS
    ".*yarn\\.lock$", //JS
    ".*pnpm-lock\\.yaml$", // JS
    ".*Gemfile\\.lock$", // Ruby
    ".*composer\.lock$", // PHP
    ".*Cargo\\.lock$", // Rust
    ".*go\\.sum$", // GoLang
    ".*mix\\.lock$", // Elixir
    ".*packages\\.lock\\.json$", // .NET
    ".*Package\\.resolved$", // Swift
    ".*gradle\\.lockfile$", // Java
    ".*buildscript-gradle\\.lockfile$", // Java
    ".*conan\\.lock$", // C/C++
    ".*renv\\.lock$", // R
  ]
  let currentExclusions = exclusionsTextBox.value.split("\n")

  if (currentExclusions.length === 1 && currentExclusions[0] === "") {
    currentExclusions = []
  }

  currentExclusions = currentExclusions.concat(defaultExclusions)
  exclusionsTextBox.value = currentExclusions.join("\n")
  saveExclusions()
})

// Returning Exclusions List to content script
function sendExclusionsList(message, sender, sendResponse) {
  let exclusions = localStorage.getItem("gh-lines-viewed-exclusions-list")
  sendResponse(JSON.parse(exclusions))
}
