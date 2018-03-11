'use strict';
const puppeteer = require('puppeteer');
(async() => {
  //const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome'});
  const page = await browser.newPage();
  await page.goto('http://www.ifeng.com');
  await page.screenshot({
      path: '/home/jingwu/Desktop/ifeng.png',
      fullPage: true,
      //clip: {width:'100%', height:'3000px'}
  });
  browser.close();
})();




/*
const puppeteer = require('puppeteer');
puppeteer.launch().then(async browser => {
  const page = await browser.newPage();
  await page.goto('https://www.google.com');
  // other actions...
  await browser.close();
});
*/

