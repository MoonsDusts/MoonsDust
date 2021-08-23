import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';

const COLOR_DIM = '\x1b[2m';
const COLOR_RESET = '\x1b[0m';

interface DebugTrace {
  gas: number;
  returnValue: any;
  structLogs: StructLog[];
}

interface StructLog {
  depth: number;
  error: any;
  gas: number;
  gasCost: number;
  memory: null;
  op: string;
  pc: number;
  stack: string[];
  storage: null;
}

const interfaceArray: ethers.utils.Interface[] = [];

function removeNumericKeysFromStruct(inputStruct: ethers.utils.Result) {
  const returnObj: { [key: string]: any } = {};
  Object.entries(inputStruct)
    .filter((entry, i) => {
      if (entry[0] === 'length') return false;
      if (entry[0] === String(i)) return false;
      return true;
    })
    .forEach((entry) => (returnObj[entry[0]] = entry[1]));
  return returnObj;
}

export async function parseReceipt(
  tx:
    | Promise<ethers.ContractTransaction>
    | ethers.ContractTransaction
    | Promise<ethers.providers.TransactionResponse>
    | ethers.providers.TransactionResponse,
  traceTransaction: boolean = true, // this should be manually marked false for contract deployments (causes huge computation)
  debug_mode: boolean = !!process.env.DEBUG // if this is false, the method returns the receipt right away
) {
  const r = await (await tx).wait();
  if (!debug_mode) return r;
  const gasUsed = r.gasUsed.toNumber();
  // console.group();
  console.log(
    COLOR_DIM,
    `\nGas used: ${gasUsed} / ${ethers.utils.formatEther(
      r.gasUsed.mul(ethers.utils.parseUnits('1', 'gwei'))
    )} ETH / ${gasUsed / 50000} ERC20 transfers`,
    COLOR_RESET
  );

  const buildFolderPath = path.resolve(
    __dirname,
    '..',
    '..',
    'build',
    'artifacts'
  );
  const filesToIgnore: { [key: string]: boolean } = { '.DS_Store': true };

  function loadABIFromThisDirectory(relativePathArray: string[] = []) {
    const pathArray = [buildFolderPath, ...relativePathArray];
    fs.readdirSync(path.resolve(buildFolderPath, ...relativePathArray)).forEach(
      (childName) => {
        if (filesToIgnore[childName]) return;
        const childPathArray = [...relativePathArray, childName];
        // console.log({childPathArray});
        if (
          fs
            .lstatSync(path.resolve(buildFolderPath, ...childPathArray))
            .isDirectory()
        ) {
          loadABIFromThisDirectory(childPathArray);
        } else {
          const content = JSON.parse(
            fs.readFileSync(
              path.resolve(buildFolderPath, ...childPathArray),
              'utf8'
            )
          );
          // console.log({content});
          const iface = new ethers.utils.Interface(content.abi);
          interfaceArray.push(iface);
        }
      }
    );
  }

  if (!interfaceArray.length) loadABIFromThisDirectory();

  r.logs.forEach((log, i) => {
    let output;

    for (const iface of interfaceArray) {
      try {
        output = iface.parseLog(log);
        if (output) {
          break;
        }
      } catch {}
    }

    if (!output) {
      console.log(COLOR_DIM, { log }, COLOR_RESET);
    } else {
      console.log(
        COLOR_DIM,
        i,
        output.name,
        removeNumericKeysFromStruct(output.args),
        COLOR_RESET
      );
    }
  });

  // Internal transasctions
  if (traceTransaction) {
    let resp: DebugTrace;
    try {
      resp = await global.provider.send('debug_traceTransaction', [
        r.transactionHash,
        { disableMemory: true, disableStorage: true },
      ]);
    } catch {
      // transaction doesnot exist or debug method does not exist on the provider
      return;
    }

    const addressesToExclude: string[] = [
      // '0x0000000000000000000000000000000000000001'
    ];

    resp.structLogs
      .filter((log) => log.op === 'CALL')
      .forEach((log) => {
        const stack = [...log.stack];
        const gas = stack.pop();

        const address = ethers.utils.hexZeroPad(
          ethers.utils.hexStripZeros('0x' + stack.pop()),
          20
        );
        const formattedValue = ethers.utils.formatEther(
          ethers.BigNumber.from('0x' + stack.pop())
        );
        if (!addressesToExclude.includes(address)) {
          console.log(
            COLOR_DIM,
            `Trace: internal tx to ${address}: ${formattedValue} (${+(
              '0x' + gas
            )} gas)`,
            COLOR_RESET
          );
        }
      });
    // console.groupEnd();
  }

  return r;
}
