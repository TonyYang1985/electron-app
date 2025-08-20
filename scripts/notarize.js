exports.default = async function(context) {
  if (context.electronPlatformName !== 'darwin') {
    console.log('🍎 Notarization skipped (not macOS)');
    return;
  }
  console.log('🍎 macOS notarize hook executed');
};
