const R = require('ramda');

const isEndFunction = R.includes('- http: POST ');

const isNoConfig = R.includes('{}');

const isNewPart_ = R.pipe(
  R.split(''),
  R.head,
  R.equals(' '),
  R.not
);

const deleteLastLine = R.pipe(
  R.split('\n'),
  R.dropLast(1),
  R.join('\n')
);

const prettifyYAML = R.pipe(
  R.split('\n'),
  R.map(
    R.pipe(
      R.when(isNewPart_, R.concat('\n')),
      R.when(isEndFunction, R.concat(R.__, '\n'))
    )
  ),
  R.reject(isNoConfig),
  R.join('\n'),
  R.replace('\n', ''),
  R.replace(/\n{2,}/g, '\n\n'),
  deleteLastLine //TODO find regex to do it
);

module.exports = {prettifyYAML};
