const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const babel = require('@babel/core');

const readFileAsync = promisify(fs.readFile);
const accessAsync = promisify(fs.access);

function transform(code, options) {
  return babel.transform(code, {
    plugins: [[path.resolve(__dirname, '../'), options]],
  }).code;
}

async function getFixtureFiles(fixtureName) {
  const [input, output] = await Promise.all(
    ['input.js', 'output.js'].map(filename =>
      readFileAsync(path.resolve(fixturePath, fixtureName, filename)),
    ),
  );
  const optionPath = path.resolve(fixturePath, fixtureName, 'options.js');
  let options = {};
  try {
    await accessAsync(optionPath);
    options = require(optionPath);
  } catch (e) {}
  return {
    input: input.toString(),
    output: output.toString(),
    options,
  };
}

function clearEOL(str) {
  return str.replace(/[\n\r]/g, '');
}

const fixturePath = path.resolve(__dirname, 'fixtures');
const files = fs.readdirSync(fixturePath); // use jest -t
files.forEach(function(fixtureName) {
  test(`should transform ${fixtureName} success`, async function() {
    const { input, output, options } = await getFixtureFiles(fixtureName);
    expect(clearEOL(transform(input, options))).toEqual(clearEOL(output));
  });
});
