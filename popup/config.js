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
  exclusionsTextBox.disabled = !exclusionsTextBox.disabled

  if (editExclusionsButton.textContent.trim() === "Edit") {
    editExclusionsButton.textContent = "Save"
    editExclusionsButton.classList.add("btn-success")
    editExclusionsButton.classList.remove("btn-primary")
  } else {
    // Cosmetic Changes
    editExclusionsButton.textContent = "Edit"
    editExclusionsButton.classList.add("btn-primary")
    editExclusionsButton.classList.remove("btn-success")
    saveExclusions()
  }
})

function saveExclusions() {
  // Save data
  const patternStrings = exclusionsTextBox.value.split("\n")
  const validPatterns = []
  const badPatterns = []

  for (let i = 0; i < patternStrings.length; i++) {
    try {
      RegExp(patternStrings[i])
      validPatterns.push(patternStrings[i])
    } catch (error) {
      badPatterns.push(patternStrings[i])
    }
  }

  const alertPlaceholder = document.getElementById("invalidRegexAlert")
  alertPlaceholder.innerHTML = ""

  if (badPatterns.length > 0) {
    setAlertMessage(badPatterns)
  } else {
  }

  localStorage.setItem(
    "gh-lines-viewed-exclusions-list",
    JSON.stringify(validPatterns),
  )
}

function setAlertMessage(incorrectRegexes) {
  const alertPlaceholder = document.getElementById("invalidRegexAlert")
  const alert = document.createElement("div")

  alert.setAttribute("role", "alert")
  alert.classList.add("alert", "alert-danger", "alert-dismissible")

  const message = document.createElement("p")
  message.textContent = "The following regex patterns are invalid:"

  const messageDiv = document.createElement("div")
  messageDiv.appendChild(message)

  for (let i = 0; i < incorrectRegexes.length; i++) {
    const singleRegex = document.createElement("code")
    singleRegex.textContent = incorrectRegexes[i]

    messageDiv.appendChild(singleRegex)
    messageDiv.appendChild(document.createElement("br"))
  }

  const button = document.createElement("button")
  button.setAttribute("type", "button")
  button.classList.add("btn-close")
  button.setAttribute("data-bs-dismiss", "alert")
  button.setAttribute("aria-label", "Close")

  alert.appendChild(messageDiv)
  alert.appendChild(button)
  alertPlaceholder.append(alert)
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
    ".*composer.lock$", // PHP
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
