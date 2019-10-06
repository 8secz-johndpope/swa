const ora = require('ora')
const { Whatsapp } = require('../api/whatsapp')
const { isAuthenticated, isInsideChat, retrieveQR } = require('./auth')
const { initWhatsapp, injectApi } = require('./browser')

const spinner = ora({
  stream: process.stdout
});

/**
 * Should be called to initialize whatsapp client
 */
exports.create =  async () => {
  spinner.start('Initializing whatsapp');
  let waPage = await initWhatsapp();
  spinner.succeed();

  spinner.start('Authenticating');
  const authenticated = await isAuthenticated(waPage);

  // If not authenticated, show QR and wait for scan
  if (authenticated) {
    spinner.succeed();
  } else {
    spinner.info('Authenticate to continue');
    await retrieveQR(waPage);

    // Wait til inside chat
    await isInsideChat(waPage).toPromise();
    spinner.succeed();
  }

  spinner.start('Injecting api');
  waPage = await injectApi(waPage);
  spinner.succeed('Whatsapp is ready');

  return new Whatsapp(waPage);
}
