#
# Binaries.
#
VERSION=1.0.2
ESLINT = node_modules/.bin/eslint
UGLIFYJS = node_modules/.bin/uglifyjs
BROWSERIFY = node_modules/.bin/browserify
KARMA = node_modules/.bin/karma
MOCHA = node_modules/.bin/mocha
WATCHIFY = node_modules/.bin/watchify


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
	rm -rf node_modules
.PHONY: distclean

#
# Build tasks.
#

# Build journey-tracker.js.
journey-tracker.js: node_modules $(SRC) package.json
	@$(BROWSERIFY) --standalone jtr lib/index.js > $@

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

#run karma tests
functional: clean lint build
	@$(KARMA) start test/functional/karma.conf.js --single-run --no-colors
.PHONY: functional

#run karma tests
unit: lint
	@$(MOCHA) test/unit/
.PHONY: unit

test: unit functional
.PHONY: test

# continue to run karma test in the background, you may want to run task
# watchify as well to allow journey-tracker.js regenerate on change
watch-functional: clean lint build
	@$(KARMA) start test/functional/karma.conf.js --no-colors
.PHONY: watch-functional

# watch code changes and regenerate journey-tracker.js continously
# useful when debugging code in browser
watchify: node_modules $(SRC) package.json
	@$(WATCHIFY) --standalone jtr lib/index.js -o journey-tracker.js
.PHONY: watchify

deploy: clean lint build
	@aws s3 cp journey-tracker.min.js.gz s3://cdn.journey-app.io/v$(VERSION)/journey-tracker.min.js --cache-control "public, max-age=7200" --content-encoding "gzip"

.PHONY: deploy
