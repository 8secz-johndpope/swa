const path = require('path')
const puppeteer = require('puppeteer')
const { puppeteerConfig } = require('../config')

exports.initWhatsapp = async () => {
  const browser = await initBrowser();
  const waPage = await getWhatsappPage(browser);

  await waPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3641.0 Safari/537.36');

  await waPage.setRequestInterception(true);

	waPage.on('request', (request) => {
		request.continue();
	});

  await waPage.goto(puppeteerConfig.whatsappUrl);
  return waPage;
}

exports.injectApi = async (page) => {
  await page.addScriptTag({
    path: require.resolve(path.join(__dirname, '../lib', 'wapi.js'))
  });
  await page.addScriptTag({
    path: require.resolve(path.join(__dirname, '../lib', 'middleware.js'))
  });

  return page;
}

async function initBrowser() {
  const browser = await puppeteer.launch({
    //headless: false,
    headless: true,
		ignoreHTTPSErrors: true,
    devtools: false,
    userDataDir: path.join(process.cwd(), 'tmp'),
    args: [...puppeteerConfig.chroniumArgs]
  });
  return browser;
}

async function getWhatsappPage(browser) {
  const pages = await browser.pages();
  console.assert(pages.length > 0);
  return pages[0];
}
