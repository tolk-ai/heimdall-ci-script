const R = require('ramda');
const {readJson} = require('./file');

const getEnvironmentValue = envValue =>
  `${'${self:custom.${self:custom.stage}.'}${envValue}}`;

const getEnvironment = R.pipe(
  R.keys,
  R.converge(R.zipObj, [R.identity, R.map(getEnvironmentValue)])
);

const priority = ['dev', 'docker'];

const manageValue = R.applySpec({
  dev: R.identity,
  docker: R.identity
});

const addLast = R.converge(R.append, [R.last, R.identity]);

const isSizeLessThan = R.curry((array1, array2) =>
  R.pipe(
    R.unapply(R.map(R.length)),
    R.apply(R.lte)
  )(array1, array2)
);

const extendConfig = R.until(isSizeLessThan(priority), addLast);

const manageArray = R.pipe(
  extendConfig,
  R.zipObj(priority)
);

const init_ = (key, defaultValue) =>
  R.over(R.lensProp(key), R.defaultTo(defaultValue));

const initFrom_ = (key, from) =>
  R.converge(R.over(R.lensProp(key)), [
    R.pipe(
      R.prop(from),
      R.defaultTo
    ),
    R.identity
  ]);
//
const initDocker_ = initFrom_('docker', 'dev');

const manageObj = R.pipe(
  init_('dev', ''),
  initDocker_
);

//sort un obj avec dev, docker et prod
const getConfig = R.cond([
  [R.is(Array), manageArray],
  [R.is(Object), manageObj],
  [R.T, manageValue]
]);

const getSubKeys = R.pipe(
  R.values,
  R.head,
  R.keys
);

const getObjByKey = obj =>
  R.converge(R.objOf, [R.identity, R.pluck(R.__, obj)]);

const reverseKey_ = obj =>
  R.pipe(
    getSubKeys,
    R.map(getObjByKey(obj)),
    R.mergeAll
  )(obj);

const addOverride = (value, key) => `${'${env:'}${key}, '${value}'}`;

const getCustom = R.pipe(
  R.mapObjIndexed(getConfig),
  R.when(
    R.complement(R.isEmpty),
    R.pipe(
      reverseKey_,
      R.mapObjIndexed(R.mapObjIndexed(addOverride)),
      R.assoc('stage', '${opt:stage, self:provider.stage}'),
      R.toPairs,
      R.move(-1, 0),
      R.fromPairs
    )
  )
);

const getSlsEnv = R.pipe(
  R.unapply(R.append('package.json')),
  R.join('/'),
  readJson,
  R.prop('sls-env')
);

module.exports = {getEnvironment, getCustom, getSlsEnv};
