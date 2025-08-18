exports.default = async function(context) {
  console.log('🔨 Before build hook executed');
  console.log(`Platform: ${context.platform.name}`);
};
