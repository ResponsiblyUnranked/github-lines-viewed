ARTIFACTS_DIR = web-ext-artifacts

.PHONY: install-dependencies lint release-zip patch minor major


install-dependencies:
# 	Install pinned Prettier and web-ext versions
	npm ci


lint:
# 	Check formatting with Prettier (fails if files are poorly formatted)
	npx prettier --check lines-viewed.js popup/ scripts/ manifest.json

# 	Validate the extension against Firefox's add-on rules
	npx web-ext lint


release-zip: lint
# 	Package the extension for upload to the Firefox add-ons store
	npx web-ext build --artifacts-dir $(ARTIFACTS_DIR) --overwrite-dest


patch:
	@NEW_VERSION=$$(node scripts/bump-version.mjs patch) && \
	echo "Committing manifest.json as Release $$NEW_VERSION" && \
	git add manifest.json && \
	git commit -m "Release $$NEW_VERSION"

minor:
	@NEW_VERSION=$$(node scripts/bump-version.mjs minor) && \
	echo "Committing manifest.json as Release $$NEW_VERSION" && \
	git add manifest.json && \
	git commit -m "Release $$NEW_VERSION"

major:
	@NEW_VERSION=$$(node scripts/bump-version.mjs major) && \
	echo "Committing manifest.json as Release $$NEW_VERSION" && \
	git add manifest.json && \
	git commit -m "Release $$NEW_VERSION"
