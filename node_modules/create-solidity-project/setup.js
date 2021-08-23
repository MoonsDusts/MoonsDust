#!/usr/bin/env node
const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
require('colors');

var argv = require('minimist')(process.argv.slice(2));
// console.log(argv);

if (!argv._[0]) {
  throw new Error('Please pass directory name');
}

let templateName = 'JavaScript';
if (argv.template || argv.t) {
  if (['typescript', 'tsc', 'ts'].includes(argv.template || argv.t)) {
    templateName = 'TypeScript';
  } else if (['javascript', 'js'].includes(argv.template || argv.t)) {
    templateName = 'JavaScript';
  } else {
    throw new Error(
      `Unknown template: ${argv.template || argv.t}. Did you mean typescript?`
    );
  }
}

const name = argv._[0];
let initiating_text = `\nInitiating ${
  'Create Solidity Project'.cyan.underline
}`;
if (templateName !== 'JavaScript') {
  initiating_text += ` with ${templateName.cyan.underline}`;
}
console.log(initiating_text + ':\n');

templateName = templateName.toLowerCase();
const template = require(`./templates/${templateName}/setup.json`);

process.stdout.write(
  `Creating ${name.green} directory and installing files...`
);
fs.mkdirSync(path.resolve(process.cwd(), name));
template.files.forEach((filePath) => {
  const from = filePath.from.split('/');
  const to = filePath.to ? filePath.to.split('/') : from;

  fs.copySync(
    path.resolve(__dirname, 'templates', templateName, ...from),
    path.resolve(process.cwd(), name, ...to)
  );
});

const packageJson = {
  name,
  ...template.packageJson,
};

fs.writeFileSync(
  path.resolve(process.cwd(), name, 'package.json'),
  JSON.stringify(packageJson, null, 2),
  { encoding: 'utf8' }
);
readline.clearLine(process.stdout);
readline.cursorTo(process.stdout, 0);
process.stdout.write(`Created ${name.green} directory and installed files.\n`);

const { execSync } = require('child_process');

const execSyncSilent = (command) =>
  execSync(command, {
    cwd: path.resolve(process.cwd(), name),
    stdio: 'ignore',
  });

const packageNames = template.packages.map((p) => p.name);

template.packages.forEach((package, i) => {
  let text = `Installing ${packageNames.join(', ')}...`;
  if (text.length > process.stdout.columns) {
    text = `Installing ${packageNames[i]} ${
      `(${
        packageNames.slice(i).length === 0
          ? 'final remaining'
          : `${packageNames.slice(i).length} more remaining`
      })`.grey
    }`;
  }
  process.stdout.write(text);
  execSyncSilent(
    `npm i ${package.name}@${package.version}${
      package.type === 'dev' ? ' --save-dev' : ''
    }`
  );
  readline.clearLine(process.stdout);
  readline.cursorTo(process.stdout, 0);
  packageNames[i] = packageNames[i].green;
});

process.stdout.write(`Installed ${packageNames.join(', ')}.\n`);

if (packageJson.scripts.postinstall) {
  execSyncSilent(`npm run postinstall`);
}

process.stdout.write(`Initiating Git Repository...`);
let isGitSuccess = true;
try {
  execSyncSilent(`git init && git add . && git commit -m "Initial commit"`);
} catch {
  isGitSuccess = false;
}
readline.clearLine(process.stdout);
readline.cursorTo(process.stdout, 0);
process.stdout.write(
  isGitSuccess
    ? `Initialized Git Repository.\n`
    : `Git initializaiton failed. Please try it manually.`
);

console.log(`\nStart with changing the directory:`);
console.log(`cd ${name}`.green);
console.log(`npm test\n`.green);
console.log('You can check README file for additional information.');
console.log('Happy BUIDLing!\n');
