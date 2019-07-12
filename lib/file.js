const R = require('ramda');
const fs = require('fs-extra');
const YAML = require('yaml');
const {join} = require('path');
const {strOptions} = require('yaml/types');
strOptions.fold.lineWidth = 0;

const {prettifyYAML} = require('./prettify-yaml');

const readDir = fs.readdirSync;

const readFile = fs.readFileSync;
const readJson = fs.readJsonSync;

const readYaml = R.pipe(
  readFile,
  R.toString,
  YAML.parse
);
const writeFile = R.curry((path, buffer) => fs.writeFileSync(path, buffer));
const writeJson = R.curry((path, buffer) => fs.writeJsonSync(path, buffer));

const writeYaml = R.curry((path, buffer) =>
  R.pipe(
    YAML.stringify,
    prettifyYAML,
    writeFile(path)
  )(buffer)
);

const isDirectory = R.curry((path, file) =>
  fs.statSync(join(path, file)).isDirectory()
);

const listDir = path =>
  R.pipe(
    readDir,
    R.filter(isDirectory(path))
  )(path);

module.exports = {
  listDir,
  readDir,
  readFile,
  readJson,
  readYaml,
  writeFile,
  writeJson,
  writeYaml
};
