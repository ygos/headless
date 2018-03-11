'use strict';

const puppeteer = require('puppeteer');

async function shili_evaluate(url) {
    const browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome'});
    const page = await browser.newPage();
    await page.goto(url);
    //字符串可以做为函数执行
    console.log(await page.evaluate('10 + 1'));
    //反引号包起来的字符串
    console.log(await page.evaluate(`20 + 2`));
    //简单的函数，并传参数
    console.log(await page.evaluate((a,b) => a + b, 30, 3));
    //执行，将结果作为Promise返回
    console.log(await page.evaluate(x => { return Promise.resolve(8 * x); }, 7));
    //执行纯原生JS, 并将结果返回
    console.log(await page.evaluate(() => {
        var rows = [];
        var as = document.querySelectorAll('a');
        for(var i in as) {
            rows.push({'tag':as[i].nodeName, 'index':i, 'innerHtml':as[i].innerHTML});
        }
        return rows;
    }));
    await browser.close();
    return 'ok'
}

async function parseEvent(url) {
    //const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome'});
    const page = await browser.newPage();
    await page.goto(url);
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
    await browser.close();
    return results;
}

shili_evaluate('http://doc.local.com/')
.then(function(result){
    console.log(result);
});

//parseEvent('http://www.ifeng.com/')
//.then(function(items) {
//    console.log(items);
//});

