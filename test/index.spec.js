const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const babel = require('@babel/core');
const numeral = require('numeral');

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
  const configPath = path.resolve(fixturePath, fixtureName, 'config.js');
  let config = {};
  try {
    await accessAsync(configPath);
    config = require(configPath);
  } catch (e) {}
  return {
    input: input.toString(),
    output: output.toString(),
    config,
  };
}

function clearEOL(str) {
  return str.replace(/[\n\r]/g, '');
}

const fixturePath = path.resolve(__dirname, 'fixtures');
const files = fs.readdirSync(fixturePath); // use jest -t
files.forEach(function(fixtureName) {
  test(`should transform ${fixtureName} success`, async function() {
    const { input, output, config } = await getFixtureFiles(fixtureName);
    const transformedCode = transform(input, config.options);
    expect(clearEOL(transformedCode)).toEqual(clearEOL(output));
    if (config.result) {
      const { value } = config.result;
      eval(transformedCode);
      expect(result).toEqual(value);
    }
  });
});
