const popoverTriggerList = document.querySelectorAll(
  '[data-bs-toggle="popover"]',
)
const popoverList = [...popoverTriggerList].map(
  (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl),
)

const editExclusionsButton = document.getElementById("editExclusions")
const insertCommonExclusionsButton = document.getElementById(
  "insertCommonExclusions",
)
const exclusions = document.getElementById("exclusionList")
const invalidRegexAlert = document.getElementById("invalidRegexAlert")

editExclusionsButton.addEventListener("click", function () {
  // Cosmetic Changes
  insertCommonExclusionsButton.disabled = !insertCommonExclusionsButton.disabled
  exclusions.disabled = !exclusions.disabled

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

    // Save data
    const patternStrings = exclusions.value.split("\n")
    const regexPatterns = []
    const badPatterns = []
    let badPatternError = ""

    for (let i = 0; i < patternStrings.length; i++) {
      try {
        regexPatterns.push(new RegExp(patternStrings[i]))
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
  }
})

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
