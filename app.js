const ProxyVerifier = require('proxy-verifier');
const puppeteer = require('puppeteer');

const scrape = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  let page = await browser.newPage();

  await page.goto('https://www.my-proxy.com/free-elite-proxy.html');
  const proxies = await page.content();
  const regex = /[0-9]+(?:\.[0-9]+){3}:[0-9]+/g;

  let matches = proxies.match(regex);
  let result;
  try {
    result = await checkIP(matches[0]);
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
    };

    ProxyVerifier.testAll(proxy, (error, result) => {
      if (error) {
        resolve(error);
      } else {
        resolve(result);
      }
    });
  });
};

scrape();
