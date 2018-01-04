'use strict';

const puppeteer = require('puppeteer');

function sniffDetector() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;

  window.navigator.__defineGetter__('userAgent', function() {
    window.navigator.sniffed = true;
    return userAgent;
  });

  window.navigator.__defineGetter__('platform', function() {
    window.navigator.sniffed = true;
    return platform;
  });
}

(async() => {
const browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome'});
const page = await browser.newPage();
await page.evaluateOnNewDocument(sniffDetector);
//await page.goto('https://www.ifeng.com', {waitUntil: 'networkidle2'});
await page.goto('http://www.ifeng.com');
console.log('Sniffed: ' + (await page.evaluate(() => !!navigator.sniffed)));

await browser.close();

})();
