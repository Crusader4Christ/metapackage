const { ContainerBuilder, JsonFileLoader} = require('node-dependency-injection');
const resolveConfiguration = require('./resolve-configuration');


module.exports = function loadLambdaDI(lambdaName) {
  const lambdaPath = resolveConfiguration.getLambdaPath(lambdaName);
  const container = new ContainerBuilder(true);
  let loader = new JsonFileLoader(container);
  loader.load(lambdaPath + '/di.json');
  let definition = container.register('lambdaPath');
  definition.synthetic = true;
  container.set('lambdaPath', lambdaPath);
  return container
};

