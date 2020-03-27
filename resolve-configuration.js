const path = require("path");
const fs = require("fs");
const jsYaml = require("js-yaml");
const reYml = /\.yml$/i;

function load(ymlFile) {
  let rawContent;
  try {
    rawContent = fs.readFileSync(ymlFile);
  } catch (e) {
    console.error(e)
  }
  
  return jsYaml.safeLoad(rawContent);
}

function resolve(lambdaPath, ymlFile) {
  ymlFile = path.join(lambdaPath, ymlFile );
  if (!fs.existsSync(ymlFile)) return;
  console.log(`processing ${ymlFile}:`);
  let content = load(ymlFile);
 
  for (let s of Object.keys(content.services)) {
    let service = content.services[s];
    let classPath = service.class, paths;
    if (classPath.substr(0,16) === "../node_modules/") {
      classPath = classPath.substr(16)
    }
    paths = require.resolve.paths(classPath);
    let className = './'+path.basename(classPath);
    classPath = path.dirname(classPath);
    paths.push(path.join(lambdaPath, path.dirname(service.class)), path.join(lambdaPath, 'node_modules', classPath), path.join(lambdaPath, 'dist', classPath));
  
    try {
      service.class = require.resolve(service.class, {paths});
    } catch(e) {
      try {
        service.class = require.resolve(className, {paths});
      } catch(e) {
        throw e;
      }
    }
  }
  if (content.imports && Array.isArray(content.imports)) {
    for (let r of content.imports) {
      r.resource = r.resource.replace(reYml, '.json');
    }
  }
  save(ymlFile, content);
  return content;
}

/**
 * @param {string} ymlFile
 * @param content
 */
function save(ymlFile, content) {
  let jsonFile = ymlFile.replace(reYml, '.json');
  let backup = `${jsonFile}.bak`;
  if (fs.existsSync(jsonFile) && !fs.existsSync(backup)) {
    console.log(`rename ${jsonFile} to ${path.basename(backup)}`);
    fs.renameSync(jsonFile, backup);
  }
  
  fs.writeFileSync(jsonFile, JSON.stringify(content));
  console.log(`${jsonFile} saved successfully`);
}

module.exports.getLambdaPath = function(lambdaName) {
  return path.dirname(require.resolve(`${lambdaName}/package.json`));
};

module.exports.rebuildPackage = function(lambdaName) {
  console.log(`processing configuration for ${lambdaName}:`);
  const lambdaPath = this.getLambdaPath(lambdaName);
  let files = fs.readdirSync(lambdaPath);
  files.filter(name => reYml.test(name)).forEach(ymlFile => {
    resolve(lambdaPath, ymlFile);
  });
};


