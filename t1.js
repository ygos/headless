const chromeLauncher = require('chrome-launcher');
 
chromeLauncher.launch({
    startingUrl: 'http://www.ifeng.com',
    chromeFlags: ['--headless', '--disable-gpu']
}).then(chrome => {
    console.log(`Chrome debugging port running on ${chrome.port}`);
});
