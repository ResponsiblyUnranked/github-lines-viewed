function updateLinesRead(){
    console.log("updating lines!")
    let changed_files = document.querySelectorAll('copilot-diff-entry');

    let total_lines_changed = 0;
    let lines_viewed = 0;

    changed_files.forEach(changed_file => {
        let file_lines_changed = Number(changed_file.querySelector('.diffstat').textContent)
        total_lines_changed += file_lines_changed

        let checkbox = changed_file.querySelector('input[type="checkbox"]')
        if (checkbox.hasAttribute('checked')) {
            lines_viewed += file_lines_changed
        }
    })

    let progress_bar = document.querySelector('progress-bar');

    let new_ratio = `${lines_viewed} / ${total_lines_changed}`

    progress_bar.setAttribute('ratio', new_ratio)

    let progress_bar_text = progress_bar.children[0].children[0];

    progress_bar_text.innerText = progress_bar_text.innerText.replace('file', 'line').replace('files', 'lines');

}

function addCheckboxListeners(){
    console.log("adding checkbox listeners")
    let changed_files = document.querySelectorAll('copilot-diff-entry');

    changed_files.forEach(changed_file => {
        let checkbox = changed_file.querySelector('.js-replace-file-header-review')
        checkbox.addEventListener('click', updateLinesRead)

        let clickCount = 0;
        checkbox.addEventListener('click', () => {
            clickCount++;
            console.log(`Button clicked ${clickCount} times`);
        });

    })
}

addCheckboxListeners()
updateLinesRead()
