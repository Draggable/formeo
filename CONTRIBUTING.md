# Contributing

Formeo is open source to the core and contributions are always welcome. In this document we'll cover some dependencies and installation process to get your local development environment up and running.

## Submitting Issues
If you're having trouble please don't hesitate to open Issue [here](https://github.com/Draggable/formeo/issues)


### Dependencies
To develop for Formeo you'll need:

- [NodeJS](https://nodejs.org)
- [Webpack](https://webpack.github.io/)

### Recommended Tooling
While not required, the following tools are recommended to maintain code quality and consistency in style.

- [ESLint](http://jshint.com/)

### Installation

Navigate to the directory you'll be working from and run:
```
git clone https://github.com/Draggable/formeo.git
cd formeo
npm install
npm start
```

The above code will clone the repo, install the required `node_modules` and run the npm `start` task. You should now have a locally running version of the demo accessible at [http://localhost:8080/](http://localhost:8080/).

## Notes
Windows users, remember to configure your line endings with `core.autocrlf`. More info [here](https://help.github.com/articles/dealing-with-line-endings/#platform-windows)
```
$ git config --global core.autocrlf true
# Configure Git on Windows to properly handle line endings
```
