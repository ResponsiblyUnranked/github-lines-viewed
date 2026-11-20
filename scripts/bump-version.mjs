// Usage: node scripts/bump-version.mjs <major|minor|patch>
// Bumps the version in manifest.json and prints the new version.

import { readFileSync, writeFileSync } from "node:fs"

const MANIFEST_PATH = "manifest.json"
const VERSION_PATTERN = /"version": "(\d+)\.(\d+)\.(\d+)"/

function bumpVersion(major, minor, patch, bumpType) {
  switch (bumpType) {
    case "major":
      return `${major + 1}.0.0`
    case "minor":
      return `${major}.${minor + 1}.0`
    case "patch":
      return `${major}.${minor}.${patch + 1}`
    default:
      throw new Error(
        `Unknown bump type \`${bumpType}\`, expected \`major\`, \`minor\` or \`patch\``,
      )
  }
}

const bumpType = process.argv[2]
const manifest = readFileSync(MANIFEST_PATH, "utf8")
const [, major, minor, patch] = manifest.match(VERSION_PATTERN).map(Number)
const newVersion = bumpVersion(major, minor, patch, bumpType)

// Replace only the version, so the rest of the file keeps its formatting
writeFileSync(
  MANIFEST_PATH,
  manifest.replace(VERSION_PATTERN, `"version": "${newVersion}"`),
)
console.log(newVersion)
