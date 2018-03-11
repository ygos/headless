'use strict';

const puppeteer = require('puppeteer');

module.exports.parseEvent = async function (url) {
    //const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome'});
    const page = await browser.newPage();
    await page.goto(url);
    console.log(await page.evaluate((a,b) => a + b, 1, 2));
    const result = await page.evaluate(x => { return Promise.resolve(8 * x); }, 7);
    console.log(result);
    console.log(await page.evaluate(() => {
        var rows = [];
        var as = document.querySelectorAll('a');
        for(var i in as) {
            rows.push({'tag':as[i].nodeName, 'index':i, 'innerHtml':as[i].innerHTML});
        }
        return rows;
    }));

    var results = await page.evaluate(function(tags, events) {
            var rows = [];
            if(typeof(tags) == 'string') tags = [tags];
            if(typeof(events) == 'string') events = [events];
            for(var t in tags) {
                var objs = document.querySelectorAll(tags[t]);
                for(var i in objs) {
                    for(var e in events) {
                        if(objs[i][events[e]]) rows.push({'tag':tags[t], 'index':i, 'event':events[e]});
                    }
                }
            }
            return rows;
        }, 
        ['a', 'div', 'span', 'table', 'tr', 'td', 'th', 'button'], 
        ['onclick', 'ondbclick', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onkeydown', 'onkeypress', 'onkeyup']
    );
    //page.close();
    await browser.close();
    return results;
}

module.exports.browserClose = async function(url) {
    await browser.close();
}

