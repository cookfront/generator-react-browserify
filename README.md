# React App generator [![build status](https://travis-ci.org/cookfront/generator-react-browserify.svg)](https://travis-ci.org/cookfront/generator-react-browserify)

![generator](http://cookfront.qiniudn.com/generator.png)

## Features

* CSS Autoprefixing
* Built-in preview server with livereload
* Automagically compile Sass
* Automagically lint your scripts
* Awesome image optimization
* Automagically wire-up dependencies installed with [Bower](http://bower.io) *(when `gulp watch` or `gulp wiredep`)*
* Automagically browserify js file
* React Router
* ES6 support

## Getting Started

 - Install: `npm install -g generator-react-browserify`
 - Run: `yo react-browserify`
 - Serve: `gulp serve`
 - Test: `gulp jest`
 - Build: `gulp build`

## Options

 - `--skip-install` Skips the automatic execution of bower and npm after scaffolding has finished.
 - `--skip-welcome-message` Skips the yeoman welcome message.
 - `skip-install-message` Skips the message after the installation of dependencies.

## TODO

 - eslint/jsx
