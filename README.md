<div align="center">
  <img width="100" src="assets/1024.png"/>
  <h1>GitHub Lines Viewed</h1>
  <p>🔎 Enhancing the PR progress bar on GitHub to show <em><strong>lines</strong></em> viewed instead of files. 📝</p>
</div>

## Why?

Ever find yourself near the end of a review with one last file to look at,
only to find the last file has another 387 lines of changes you need to read through?

If you find GitHub's review progress bar to be misleading then this is the
browser addon for you! It changes the progress bar to be based on the number of lines
viewed, rather than the number of files.

You don't need to do anything differently, the progress bar will be replaced by the
extension, and you can enjoy a more helpful experience.

### Comparison

<img align="left" width="190" src="assets/before.png"/>
<img align="centre" width="211" src="assets/after.png"/>

## Features

### Current

- Replaces 'files viewed' with 'lines viewed'

### Planned

- File exclusion list, to ignore `.lock` files with thousands of changes not designed
for human review https://github.com/ResponsiblyUnranked/github-lines-viewed/issues/12
- Progress bar colour to change based on its value, to clearly indicate a difference
between anything < 100% and 100% https://github.com/ResponsiblyUnranked/github-lines-viewed/issues/13
- Support for all other major browsers
