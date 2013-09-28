generator:
	npm install
	git init
	git remote add origin https://grydstedt@github.com/grydstedt/schedule-me

test:
	tap test/governance/*.js
	tap test/functional/*.js

.PHONY: generator test