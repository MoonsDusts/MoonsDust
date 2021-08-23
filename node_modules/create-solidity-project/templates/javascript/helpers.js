const fs = require('fs-extra');
const path = require('path');
const ethers = require('ethers');

const interfaceArray = [];

function removeNumericKeysFromStruct(inputStruct) {
  return Object.fromEntries(Object.entries(inputStruct).filter((entry, i) => {
    if(entry[0] === 'length') return false;
    if(entry[0] === String(i)) return false;
    return true;
  }));
}

async function parseTx(tx, debug_mode = true) {
  const r = await (await tx).wait();
  if(!debug_mode) return r;
  const gasUsed = r.gasUsed.toNumber();
  console.group();
  console.log(`Gas used: ${gasUsed} / ${ethers.utils.formatEther(r.gasUsed.mul(ethers.utils.parseUnits('1','gwei')))} ETH / ${gasUsed / 50000} ERC20 transfers`);

  const buildFolderPath = path.resolve(__dirname, 'build');
  const filesToIgnore = {'.DS_Store': true};

  function loadABIFromThisDirectory(relativePathArray = []) {
    const pathArray = [buildFolderPath, ...relativePathArray];
    fs.readdirSync(path.resolve(buildFolderPath, ...relativePathArray)).forEach(childName => {
      if(filesToIgnore[childName]) return;
      const childPathArray = [...relativePathArray, childName];
      // console.log({childPathArray});
      if(fs.lstatSync(path.resolve(buildFolderPath, ...childPathArray)).isDirectory()) {
        loadABIFromThisDirectory(childPathArray);
      } else {
        const content = JSON.parse(fs.readFileSync(path.resolve(buildFolderPath, ...childPathArray), 'utf8'));
        // console.log({content});
        const iface = new ethers.utils.Interface(content.abi);
        interfaceArray.push(iface);
      }
    });
  }

  if(!interfaceArray.length) loadABIFromThisDirectory();

  r.logs.forEach((log, i) => {
    let output;

    for(const iface of interfaceArray) {
      output = iface.parseLog(log);
      if(output) {
        break;
      }
    }

    if(!output) {
      console.log({log})
    } else {
      const values = removeNumericKeysFromStruct(output.values);
      console.log(i, output.name, values);
    }
  });
  console.groupEnd();
  return r;
}

module.exports = { parseTx };
