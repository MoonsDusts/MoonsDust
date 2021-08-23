import './global';
import { startGanacheServer } from './server';
import { Ganache, SimpleStorageContract } from './suites';

let name = require('../package.json').name;
if (name) {
  const convertName = (rawName: string, symbol: string) => {
    return rawName
      .split(symbol)
      .map((word) => {
        return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };
  name = convertName(name, '_');
  name = convertName(name, '-');
} else {
  name = 'Project';
}

describe(`${name} Test Cases`, () => {
  before(() => {
    // starting ganache development blockchain
    startGanacheServer();
  });

  // test cases for checking ganache server started correctly
  Ganache();

  // Add your test hooks between before and after hooks
  SimpleStorageContract();

  after(() => {
    // stopping development blockchain
    global.server.close();
  });
});
