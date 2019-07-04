const R = require('ramda');
const {listDir, readJson, readYaml, writeYaml} = require('./lib/file');
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

const currentDirectory = getDirectory(-1);
const currentPath = process.cwd();

const getPackage = R.curry((path, moduleName) =>
  R.pipe(
    R.unapply(R.append(moduleName)),
    R.append('package.json'),
    R.join('/'),
    readJson
  )(path)
);

const noModule = ['node_modules', '.git', '.idea', '.scripts-and-ci'];

const getFunction = R.curry((moduleName, functionName) => ({
  [functionName]: {
    handler: `${moduleName}/${moduleName}.${functionName}`,
    events: [{http: `POST ${functionName}`}]
  }
}));

const getFunctionsForSubModule = R.curry((subModuleName, subModuleObj) =>
  R.pipe(
    R.prop('exposed-functions'),
    R.defaultTo([]),
    R.map(getFunction(subModuleName)),
    R.mergeAll
  )(subModuleObj)
);

const getFunctions = path =>
  R.pipe(
    listDir,
    R.reject(R.includes(R.__, noModule)),
    R.map(R.juxt([R.identity, getPackage(path)])),
    R.map(R.apply(getFunctionsForSubModule)),
    R.mergeAll
  )(path);

const functionsExposed = getFunctions(currentPath);

const slsEnv = getSlsEnv(currentPath);

const custom = getCustom(slsEnv);

const environment = getEnvironment(slsEnv);

const generateSlsYaml = pathOut =>
  R.pipe(
    readYaml,
    R.set(R.lensProp('service'), `${currentDirectory}-node`),
    R.set(R.lensPath(['provider', 'environment']), environment),
    R.set(R.lensProp('custom'), custom),
    R.set(R.lensProp('functions'), functionsExposed),
    writeYaml(`${pathOut}/serverless.yml`)
  )(`${__dirname}/asset/serverless-repo.yml`);

generateSlsYaml(process.cwd());
