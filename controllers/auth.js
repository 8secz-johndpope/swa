const ora = require('ora');
//const puppeteer = require('puppeteer')
const qrcode = require('qrcode-terminal')
const { from, merge } = require('rxjs')
const { take } = require('rxjs/operators')

const spinner = ora();

/**
 * Validates if client is authenticated
 * @returns true if is authenticated, false otherwise
 * @param waPage
 */

module.exports = {
  isAuthenticated,
  needsToScan,
  isInsideChat,
  retrieveQR
}

function isAuthenticated(waPage) {
  return merge(needsToScan(waPage), isInsideChat(waPage))
    .pipe(take(1))
    .toPromise();
};

function needsToScan(waPage) {
  return from(
    waPage
      .waitForSelector('body > div > div > .landing-wrapper', {
        timeout: 0
      })
      .then(() => false)
  );
};

function isInsideChat(waPage) {
  return from(
    waPage
      .waitForFunction(
        `
        document.getElementsByClassName('app')[0] &&
        document.getElementsByClassName('app')[0].attributes &&
        !!document.getElementsByClassName('app')[0].attributes.tabindex
        `,
        {
          timeout: 0
        }
      )
      .then(() => true)
  );
};

async function retrieveQR(waPage) {
  spinner.start('Loading QR');
  await waPage.waitForSelector("img[alt='Scan me!']", { timeout: 0 });
  const qrImage = await waPage.evaluate(
    `document.querySelector("img[alt='Scan me!']").parentElement.getAttribute("data-ref")`
  );
  spinner.succeed();
  qrcode.generate(qrImage, {
    small: true
  });

  return true;
}
