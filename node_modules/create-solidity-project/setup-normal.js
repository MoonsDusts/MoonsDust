#!/usr/bin/env node
const path = require('path');
const fs = require('fs-extra');
require('colors');

var argv = require('minimist')(process.argv.slice(2));
// console.log(argv);

if (!argv._[0]) {
  throw new Error('Please pass directory name');
}

console.log(`\nCreating`, `${argv._[0]}`.green, `directory...`);
fs.mkdirSync(path.resolve(process.cwd(), argv._[0]));
console.log('\nInstalling files...');
[
  { from: ['compile.js'] },
  { from: ['deploy.js'] },
  { from: ['helpers.js'] },
  { from: ['.gitignore'] },
  { from: ['test', 'SimpleStorage.test.js'] },
  { from: ['contracts', 'SimpleStorage.sol'] },
  { from: ['README-for-normal.md'], to: ['README.md'] },
].forEach((filePath) => {
  const from = filePath.from;
  const to = filePath.to || from;
  if (to.length > 1) {
    fs.ensureDirSync(
      path.resolve(process.cwd(), argv._[0], ...to.slice(0, to.length - 1))
    );
  }
  fs.copyFile(
    path.resolve(__dirname, ...from),
    path.resolve(process.cwd(), argv._[0], ...to),
    (err) => {
      if (err) throw err;
    }
  );
});

const packageJson = require(path.resolve(__dirname, 'package-for-normal.json'));
packageJson.name = argv._[0];

fs.writeFileSync(
  path.resolve(process.cwd(), argv._[0], 'package.json'),
  JSON.stringify(packageJson, null, 2),
  { encoding: 'utf8' }
);

const { execSync } = require('child_process');
console.log('\nInstalling dependencies...');
execSync(`cd ${argv._[0]} && npm i`);
console.log('\nInitiating Git Repository...', () => {});
execSync(
  `cd ${argv._[0]} && git init && git add . && git commit -m "Initial commit"`,
  () => {}
);
console.log('\nDone!');
console.log(`\nStart with changing the directory:`);
console.log(`cd ${argv._[0]}`.green);
console.log(`npm test\n`.green);
console.log('You can check README file for additional information.');
console.log('Happy BUIDLing!\n');
