const npmPath = require('npm-path');
npmPath.set(); //to be sure we can spawn npm process
const resolveConfiguration  = require('./resolve-configuration');

const { spawn } = require('child_process');

const packageJson = require("./package.json");

//build one dependency
function runBuild(dep) {
  return new Promise((resolve, reject) => {
    let proc = spawn('npm', ['explore', dep, 'npm', 'run', 'build'], {stdio: 'inherit'});
    let lastErr;
    proc.on('error', (err) => {
      console.error(`Failed in ${dep}`);
      lastErr = err;
    });
    proc.on('close', (code) => {
      if (code !== 0) {
        console.log(`${dep} build process exited with code ${code}`);
        return reject(lastErr || new Error(`${dep} build process exited with code ${code}`));
      }
      resolveConfiguration.rebuildPackage(dep);
      return resolve()
    });
  })
}

async function runAll() {
  for (let dep of Object.keys(packageJson.dependencies)) {
    console.log(`Start building: ${dep}`);
    await runBuild(dep).catch(console.error);
  }
}

runAll().then(()=>console.log('Done'));
