const R = require('ramda');
const kebabCase = require('just-kebab-case');
const {readJson, readYaml, writeYaml} = require('./lib/file');

const getDirectory = index =>
  R.pipe(
    R.split('/'),
    R.nth(index)
  )(process.cwd());

const getFunction = R.curry((moduleName, functionName) => ({
  [kebabCase(functionName)]: {handler: `${moduleName}.${functionName}`}
}));

const getFunctions = moduleName =>
  R.pipe(
    R.map(getFunction(moduleName)),
    R.mergeAll
  );

const currentDirectory = getDirectory(-1);
const parentDirectory = getDirectory(-2);
const currentPath = process.cwd();

const getFunctionsExposed = R.pipe(
  R.unapply(R.append('package.json')),
  R.join('/'),
  readJson,
  R.prop('exposed-functions'),
  getFunctions(currentDirectory)
);

const functionsExposed = getFunctionsExposed(currentPath);

const generateSlsYaml = pathOut =>
  R.pipe(
    readYaml,
    R.set(R.lensProp('service'), `${parentDirectory}-node`),
    R.set(R.lensProp('functions'), functionsExposed),
    writeYaml(`${pathOut}/serverless.yml`)
  )(`${__dirname}/asset/serverless-sls.yml`);

generateSlsYaml(process.cwd());
