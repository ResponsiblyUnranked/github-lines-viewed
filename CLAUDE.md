# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A browser extension (Firefox and Chrome, Manifest V2) that replaces the "files viewed" progress bar on GitHub pull request "Files changed" pages with a "lines viewed" ratio. Plain JavaScript with no build step, bundler, framework, or test suite.

## Commands

- Format: `npx prettier --write lines-viewed.js popup/ manifest.json` (config in `.prettierrc.js`: 2-space indent, no semicolons, double quotes). There is no `.prettierignore`, so avoid `prettier --write .`, which would reformat the vendored files in `style/`. Formatting is applied in dedicated "Run prettier" commits.
- Run locally: load the repository root as an unpacked/temporary extension (Firefox `about:debugging`, Chrome `chrome://extensions`). There is no automated test suite; changes are verified manually against a live GitHub PR.
- Release: bump `version` in `manifest.json` in a "Release x.y.z" commit.

## Architecture

Two scripts communicate via `browser.runtime` messaging:

- `lines-viewed.js` - content script injected on `github.com`. It supports two GitHub PR review layouts, each an object with `isActive()`, `getChangedFiles()` (returns `{ filePath, linesChanged, isViewed }`) and `showProgress(lineCounts)`:
  - `classicLayout` - `copilot-diff-entry` elements; writes the `<progress-bar ratio>` attribute, rewrites "file" to "line", and widens and recolours the existing bar.
  - `newLayout` - the React "Files changed" experience (`[data-testid="progressive-diffs-list"]`); rewrites the counter text, hides GitHub's progress circle, and inserts the extension's own bar (`.gh-lines-viewed-progress-bar`).
  - Shared logic (exclusions, line weighting, colour) is layout-independent. A single document-wide `MutationObserver` (childList, characterData, `aria-pressed`/`checked` attributes) schedules one run per animation frame; `runScript` picks the first active layout and bails early on non-PR pages.
- `popup/config.js` - loaded **both** as the background script (`manifest.json` `background.scripts`) and by `popup/config.html`. In the background context it answers the content script's `sendMessage` with the exclusions list; in the popup context it drives the exclusions editor UI. The `onMessage` listener is registered on the first line deliberately, before any DOM lookups that only succeed in the popup.

Key behaviours:

- Exclusion regexes are stored as a JSON array in extension `localStorage` under `gh-lines-viewed-exclusions-list`. Invalid patterns are filtered out on save and shown in a Bootstrap alert.
- Excluded files, binary files (non-numeric diffstat), and zero-line files each count as 1 line, so they still contribute to progress when marked viewed.
- Every DOM write must be skipped when the value is already displayed (see `setText`), otherwise the extension's own changes re-trigger the observer endlessly. Only observed mutation types matter: style and unobserved attributes are safe to rewrite.
- In the new layout, React owns the DOM: edit existing text nodes in place (`textNode.data`) rather than replacing elements, so React can continue to update them.
- All behaviour depends on GitHub's DOM. GitHub markup changes are the main source of breakage. The new layout uses hashed CSS module class names (e.g. `ProgressContainer__b1ofBm`), so selectors match the stable prefix only (`[class*="ProgressContainer__"]`).
- `style/` contains vendored Bootstrap (minified) for the popup - do not edit or reformat.

## Git workflow

The repository uses git-town (`git-town.toml`, main branch `master`).
