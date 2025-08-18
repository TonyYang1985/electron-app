exports.default = async function(context) {
  console.log('📦 After pack hook executed');
  console.log(`Platform: ${context.packager.platform.name}`);
  console.log(`Architecture: ${context.arch}`);
  console.log(`Output: ${context.appOutDir}`);
};
