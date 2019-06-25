const R = require('ramda');
const {readJson, readYaml, writeYaml} = require('./lib/file');
const {
  getCustom,
  getEnvironment,
  getSlsEnv
} = require('./lib/generation-commun');

const getDirectory = index =>
  R.pipe(
    R.split('/'),
    R.nth(index)
  )(process.cwd());

const getPreviousPath = index =>
  R.pipe(
    R.split('/'),
    R.dropLast(index),
    R.join('/')
  )(process.cwd());

const getFunction = R.curry((moduleName, functionName) => ({
  [functionName]: {handler: `${moduleName}.${functionName}`}
}));

const getFunctions = moduleName =>
  R.pipe(
    R.map(getFunction(moduleName)),
    R.mergeAll
  );

const currentDirectory = getDirectory(-1);
const parentDirectory = getDirectory(-2);
const currentPath = process.cwd();
const parentPath = getPreviousPath(1);

const getFunctionsExposed = R.pipe(
  R.unapply(R.append('package.json')),
  R.join('/'),
  readJson,
  R.prop('exposed-functions'),
  getFunctions(currentDirectory)
);

const functionsExposed = getFunctionsExposed(currentPath);

const slsEnv = getSlsEnv(parentPath);

const custom = getCustom(slsEnv);

const environment = getEnvironment(slsEnv);

const generateSlsYaml = pathOut =>
  R.pipe(
    readYaml,
    R.set(R.lensProp('service'), `${parentDirectory}-node`),
    R.set(R.lensPath(['provider', 'environment']), environment),
    R.set(R.lensProp('custom'), custom),
    R.set(R.lensProp('functions'), functionsExposed),
    writeYaml(`${pathOut}/serverless.yml`)
  )(`${__dirname}/asset/serverless-sls.yml`);

generateSlsYaml(process.cwd());
