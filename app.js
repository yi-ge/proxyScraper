const ProxyVerifier = require('proxy-verifier');
const axios = require('axios');
const puppeteer = require('puppeteer');

const output = [];

const scrape = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  let page = await browser.newPage();

  await page.goto('https://www.my-proxy.com/free-elite-proxy.html');
  const proxies = await page.content();
  const regex = /[0-9]+(?:\.[0-9]+){3}:[0-9]+/g;

  // const elite = [];
  let matches = proxies.match(regex);
  // let result;
  // checkIP(matches[0])
  //   .then(outcome => {
  //     console.log('first result is', outcome);
  //     result = outcome;
  //   })
  //   .catch(err => {
  //     console.log('ERROR!', err);
  //     result = err;
  //   });
  let result;
  try {
    result = await checkIP(matches[0]);
    // matches.forEach(match => {
    //   checkIP(match);
    // });
    console.log('output is', result);
  } catch (err) {
    console.log(err);
  }
};

const checkIP = async ipAddress => {
  return new Promise((resolve, reject) => {
    let split = ipAddress.split(':');
    let proxy = {
      ipAddress: split[0],
      port: split[1],
      protocols: ['http', 'https', 'socks4', 'socks5'],
      // protocol: 'http',
    };

    // console.log('proxy object is', proxy);
    ProxyVerifier.testAll(proxy, (error, result) => {
      if (error) {
        console.log('error', error, 'result', result);
        resolve(error);
        // resolve(error);
      } else {
        console.log('error', error, 'result', result);
        resolve(result);
      }
    });
  });
};

const callback = result => {
  return result;
};

scrape();
