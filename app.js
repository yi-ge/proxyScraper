const ProxyVerifier = require('proxy-verifier');
const puppeteer = require('puppeteer');
const util = require('util');

let good = [];
let bad = [];

const scrape = async () => {
  const browser = await puppeteer.launch(
    // {args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignoreHTTPSErrors'],}
    { ignoreHTTPSErrors: true }
  );
  let page = await browser.newPage();
  page.on('console', consoleObj => {
    console.log(consoleObj.text());
  });

  // await page.goto('https://www.my-proxy.com/free-elite-proxy.html');
  // await page.goto('https://proxy.l337.tech/txt');
  await page.goto('http://spys.one/free-proxy-list/US/');
  // await page.$$eval('.spy1x', elements => {
  //   [...elements].forEach(element => {
  //     const ip = element.querySelector()
  //   })
  // })
  let ipAddresses = await page.$eval('body', element => {
    const regex = /[0-9]+(?:\.[0-9]+){3}:[0-9]+/g;
    let iT = element.innerText;
    let match = iT.match(regex);
    console.log('spy1x innertext', match.toString());
    return match;
  });
  console.log('did we get a return?', ipAddresses);

  // const proxies = await page.content();
  // const regex = /[0-9]+(?:\.[0-9]+){3}:[0-9]+/g;

  // let matches = proxies.match(regex);
  // let result;
  // result = await checkIP(matches[0]);
  // console.log('output is', result);
  // for (let i = 0; i < 50; i++) {
  //   checkIP(matches[i]);
  // }
};

const spysOne = async page => {};

const checkIP = ipAddress => {
  // return new Promise((resolve, reject) => {
  let split = ipAddress.split(':');
  let proxy = {
    ipAddress: split[0],
    port: split[1],
    protocols: ['http', 'https', 'socks4', 'socks5'],
  };

  ProxyVerifier.testAll(proxy, (error, result) => {
    if (error) {
      // console.log('error', error);
      // resolve(error);
      console.log('there would have been an error');
    } else {
      if (result.anonymityLevel != null) {
        console.log('result: good', result);
        // ONLY INSTANCE OF GOOD RESULT
      } else {
        console.log('there would have been an error');
        // console.log(
        //   'result',
        //   util.inspect(result.protocols.http),
        //   util.inspect(result.protocols.https),
        //   util.inspect(result.protocols.socks4),
        //   util.inspect(result.protocols.socks5)
        // );
        // }
        // resolve(result);
      }
    }
  });
  // });
};

scrape();
