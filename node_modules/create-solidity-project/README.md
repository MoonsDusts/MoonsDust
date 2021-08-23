# Create Solidity Project

Generates a raw dependency project for developing smart contracts.

Create Solidity Project is tested on macOS and Linux.<br />
If something doesn't work, [file an issue](https://github.com/zemse/create-solidity-project/issues/new).

## Quick Steps

### Setting up a normal project

```sh
$ npx create-solidity-project project-name
```

### Setting up a typescript project

```sh
$ npx create-solidity-project project-name --template typescript
```

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))_

#### Known Issues

- The typescript project has problems on Windows OS while generating types for smart contract ([ethereum-ts/TypeChain#271](https://github.com/ethereum-ts/TypeChain/issues/271)).

## Why should one use raw dependencies instead of frameworks?

1. In the current phase of blockchain development, most of the tools are well tested for basic features but complex utils might have bugs since less devs might have used them. Using a framework, with dependencies in which bugs are found and fixed more frequently results in receiving **late updates** in case a particular internal dependency breaks and needs update. Android OS users can relate with this, updates released directly from Google are available instantly to users in Pixel or Motorola, while for brands like Samsung releases OS with mod at after a delay. It's just a matter of choice of techies ;)
2. Frameworks abstract inner functionality away from devs to make it smooth, but this results in **lesser learnings** of blockchain internals for beginner devs.

## Things to consider

**`create-solidity-project` is not a framework**, it only copys basic files and installs raw dependencies, after that you are on your own. You will need to refer documentation of the particular dependency (links mentioned in created project's README) for any further hacking in your project. If you are a learner and want to hack into internals your workflow, you can give this a try. If you have any questions, you can shoot them to [me](https://github.com/zemse).

If you are instead looking for abstraction (easy tasks become easier), this tool is NOT for that. Using some frameworks can be ideal for this requirement. Some of them: [Truffle](https://github.com/trufflesuite/truffle), [Waffle](https://github.com/EthWorks/Waffle).

If you are familiar with `create-react-app`, using smart contract frameworks can be similar to relying on magic done by `react-scripts` while few developers prefer to use with raw dependencies (with `npm run eject`) so they can hack into it.

## Javascript project

Dependencies:

- `solc`
- `ethers`
- `mocha`
- `ganache-core`
- `fs-extra`

File structure:

```js
├── build // gets generated after: npm run compile
│   └── SimpleStorage.json
│
├── contracts
│   └── SimpleStorage.sol
│
├── test
│   └── SimpleStorage.test.js
│
├── node_modules
├── compile.js // compiles if contract files changed
├── helpers.js
├── .gitignore
├── .gitattributes
├── README.md
└── package.json
```

Scripts:

- `npm run compile`: compiles your contracts if they haven't already.
- `npm run test`: compiles contracts and runs the test scripts.

## Typescript project

Dependencies:

- `solc`
- `ethers`
- `mocha`
- `ganache-core`
- `fs-extra`
- `ts-node`
- `typescript`
- `typechain`
- `@typechain/ethers-v5`
- `@types/node`
- `@types/mocha`
- `@types/fs-extra`

File structure:

```ts
├── build // gets generated after: npm run compile
│   ├── artifacts
│   │   └── SimpleStorage.json // compiled contract
│   └── typechain
│       ├── SimpleStorage.d.ts // contract type definatinons
│       └── SimpleStorageFactory.ts // contract factory (bytecode && abi)
│
├── contracts
│   └── SimpleStorage.sol
│
├── test
│   ├── suites
│   │   ├── index.ts // test import file
│   │   ├── Ganache.test.ts
│   │   └── SimpleStorage.test.ts
│   ├── utils
│   │   ├── index.ts
│   │   └── parseReceipt.ts // parses logs & contract internal txs
│   ├── global.ts // declare global vars (common stuff across tests)
│   ├── server.ts // start ganache server
│   └── index.ts // grand test import file
│
├── node_modules
├── compile.ts // compiles if contract files changed
├── .gitignore
├── .gitattributes
├── README.md
└── package.json
```

Scripts:

- `npm run compile` => compiles your contracts if they haven't already.
- `npm run test` => compiles contracts and runs the test scripts.
- `npm run test:debug` => runs tests in debug mode, this activates `parseReceipt` util to console log the contract events emitted and internal transactions executed.

## Getting Started

- `npx csp new-project-name --template tsc`.
- Start by editing `contracts/SimpleStorage.sol` and `test/SimpleStorage.test.js` file. You can try adding methods to contract and access them using `simpleStorageInstance.methodName()` in test file.

### Using parseReceipts to display the logs emitted and internal tx during the tests

```ts
// prints logs and internal txs if any occurred in DEBUG MODE
await parseReceipt(simpleStorageInstance.methodThatEmitsLogsOrInternalTxs());
```

To run tests in debug mode: `npm run test:debug`.

## More details

- This project uses [ethers.js](https://github.com/ethers-io/ethers.js), a Complete Ethereum library with wallet implementation in JavaScript. This makes it a great alternative to [web3.js](https://github.com/ethereum/web3.js). You will want to keep ethers.js [documentation](https://docs.ethers.io/ethers.js/html/) handy.
- You can customise to a specific `solc` version by doing `npm i solc@0.5.10`, but it's not recommended. Note: `solc@0.4.*` will not work with this template, because it has a different compile.js structure. It is recommended that you upgrade your smart contract code to be able to be compiled by a `solc@0.5.*` and above compiler. You can check out [breaking changes](https://solidity.readthedocs.io/en/v0.5.0/050-breaking-changes.html) in `0.5.*` and [breaking changes](https://solidity.readthedocs.io/en/v0.6.0/060-breaking-changes.html) in `0.6.*`and upgrade your smart contracts accordingly.
- If you wish to use `web3.js` instead, you can do it by uninstalling `ethers.js` using `npm uninstall ethers`, then you can install `web3.js` using `npm i web3`. Then you will have to change the tests files.

## Acknowledgement

This tool is heavily inspired from [facebook/create-react-app](https://github.com/facebook/create-react-app). Creators of this project are very much thankful to `create-react-app`'s creators and contributors.
