#
# Binaries.
#

DUO = node_modules/.bin/duo
ESLINT = node_modules/.bin/eslint
UGLIFYJS = node_modules/.bin/uglifyjs


#
# Files.
#

SRC = $(wildcard lib/*.js)

#
# Chore tasks.
#

# Install node dependencies.
node_modules: package.json $(wildcard node_modules/*/package.json)
	@npm install
	@touch node_modules

# Remove temporary/built files.
clean:
	rm -rf *.log journey-tracker.js journey-tracker.min.js journey-tracker.min.js.gz
.PHONY: clean

# Remove temporary/built files and vendor dependencies.
distclean: clean
	rm -rf components node_modules
.PHONY: distclean

#
# Build tasks.
#

# Build journey-tracker.js.
journey-tracker.js: node_modules $(SRC) package.json
	@$(DUO) --stdout --standalone journey-tracker lib/index.js > $@

# Build minified js.
journey-tracker.min.js: journey-tracker.js
	@$(UGLIFYJS) $< --output $@


# gzip it
journey-tracker.min.js.gz: journey-tracker.min.js
	@gzip < journey-tracker.min.js > journey-tracker.min.js.gz

# Build shortcut.
build: journey-tracker.min.js.gz
.PHONY: build

#
# Test tasks.
#

# Lint JavaScript source.
lint: node_modules
	@$(ESLINT) $(SRC)
.PHONY: lint


deploy: clean lint build
	@aws s3 cp journey-tracker.min.js.gz s3://cdn.journey-app.io/v1/journey-tracker.min.js --cache-control "public, max-age=7200" --content-encoding "gzip"

.PHONY: deploy
