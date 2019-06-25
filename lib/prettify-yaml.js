const R = require('ramda');

const isEndFunction = R.includes('- http: POST ');

const isNewPart_ = R.pipe(
  R.split(''),
  R.head,
  R.equals(' '),
  R.not
);

const prettifyYAML = R.pipe(
  R.split('\n'),
  R.map(
    R.pipe(
      R.when(isNewPart_, R.concat('\n')),
      R.when(isEndFunction, R.concat(R.__, '\n'))
    )
  ),
  R.join('\n'),
  R.replace('\n', ''),
  R.replace(/\n{2,}/g, '\n\n'),
  R.replace(/{}/g, '')
);

module.exports = {prettifyYAML};
