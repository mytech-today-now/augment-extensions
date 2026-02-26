const { discoverModules } = require('./cli/src/utils/module-system');

const modules = discoverModules();
const subModules = modules.filter(m => m.isSubModule);

console.log('Total modules:', modules.length);
console.log('Submodules:', subModules.length);
console.log('');

subModules.forEach(sm => {
  const parent = modules.find(m => m.fullName === sm.parentModule);
  console.log(`Submodule: ${sm.fullName}`);
  console.log(`  Parent: ${sm.parentModule}`);
  console.log(`  Parent found: ${!!parent}`);
  console.log('');
});

