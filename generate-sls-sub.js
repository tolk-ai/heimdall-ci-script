const R = require('ramda');
const kebabCase = require('just-kebab-case');
const {renameProp} = require('bobda');

const {readJson, readYaml, writeYaml} = require('./lib/file');

const getDirectory = index =>
  R.pipe(
    R.split('/'),
    R.nth(index)
  )(process.cwd());

const getFunction = R.curry((moduleName, slsEnv, functionName) => ({
  [kebabCase(functionName)]: {
    handler: `${moduleName}.${functionName}`,
    environment: slsEnv
  }
}));

const getFunctions = (moduleName, slsEnv) =>
  R.pipe(
    R.map(getFunction(moduleName, slsEnv)),
    R.mergeAll
  );

const currentDirectory = getDirectory(-1);
const parentDirectory = getDirectory(-2);
const currentPath = process.cwd();

const getKeyInPackageJsonIn = key =>
  R.pipe(
    R.unapply(R.append('package.json')),
    R.join('/'),
    readJson,
    R.prop(key)
  );

const getFunctionsExposed = slsEnv =>
  R.pipe(
    getKeyInPackageJsonIn('exposed-functions'),
    getFunctions(currentDirectory, slsEnv)
  );

const adjustMongoPassword = R.pipe(
  R.split('#'),
  R.zipObj(['name', 'key']),
  R.objOf('secretKeyRef')
);

const getEnv = R.pipe(
  R.toPairs,
  R.map(
    R.pipe(
      R.zipObj(['name', 'value']),
      R.when(
        R.propEq('name', 'MONGO_PASSWORD'),
        R.pipe(
          R.over(R.lensProp('value'), adjustMongoPassword),
          renameProp('value', 'valueFrom')
        )
      )
    )
  ),
  R.tap(x => {
    console.log('x:');
    console.log(JSON.stringify(x, null, 2));
    console.log();
  })
);

const getSlsEnv = R.pipe(
  getKeyInPackageJsonIn('sls-env'),
  getEnv
);

const slsEnv = getSlsEnv(currentPath);
const functionsExposed = getFunctionsExposed(slsEnv)(currentPath);

const generateSlsYaml = pathOut =>
  R.pipe(
    readYaml,
    R.set(R.lensProp('service'), `${parentDirectory}-node`),
    R.set(R.lensProp('functions'), functionsExposed),
    writeYaml(`${pathOut}/serverless.yml`)
  )(`${__dirname}/asset/serverless-sls.yml`);

generateSlsYaml(process.cwd());
