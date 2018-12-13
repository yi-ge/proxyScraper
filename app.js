const ProxyVerifier = require('proxy-verifier');
const puppeteer = require('puppeteer');
const util = require('util');
const {
  Worker,
  isMainThread,
  workerData,
  parentPort,
} = require('worker_threads');

let good = [];
let bad = [];
let page = '';

const scrape = async () => {
  const browser = await puppeteer.launch(
    // {args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignoreHTTPSErrors'],}
    { ignoreHTTPSErrors: true }
  );
  page = await browser.newPage();
  page.on('console', consoleObj => {
    console.log(consoleObj.text());
  });

  let spysOneProxies = await spysOne();
  let goodProxies = [];
  let chunkArrays = chunkArray(spysOneProxies, 4);
  console.log('This is the main thread');
  for (let i = 0; i < 4; i++) {
    let w = new Worker('./worker.js', {
      workerData: {
        id: i,
        list: chunkArrays[i],
      },
    });
    w.on('message', msg => {
      console.log('message is', msg);
    });
  }

  browser.close();
};

const spysOne = async () => {
  try {
    // holder for code for now
    await page.goto('http://spys.one/free-proxy-list/US/');
    let ipAddresses = await page.$eval('body', element => {
      const regex = /[0-9]+(?:\.[0-9]+){3}:[0-9]+/g;
      let iT = element.innerText;
      let match = iT.match(regex);
      return match;
    });
    console.log('returning', ipAddresses);
    return ipAddresses;
  } catch (err) {
    console.error(err);
  }
};

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
        // resolve(result);
      }
    }
  });
  // });
};

function chunkArray(myArray, chunk_size) {
  var results = [];

  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }

  return results;
}

if (isMainThread) {
  scrape();
} else {
  console.log('worker', workerData);
  for (let i = 0; i < workerData.list; i++) {
    let result = checkIP(workerData.list[i]);
    if (result) {
      parentPort.postMessage(workerData.list[i]);
    }
  }
  // parentPort.postMessage(`this message comes from worker #${workerData.id}`);
}

// ProxyVerifier.testAll(proxy, (error, result) => {
//   if (error) {
//     // console.log('error', error);
//     // resolve(error);
//     console.log('there would have been an error');
//   } else {
//     if (result.anonymityLevel != null) {
//       console.log('result: good', result);
//       // ONLY INSTANCE OF GOOD RESULT
//     } else {
//       console.log('there would have been an error');
//       // resolve(result);
//     }
//   }
// });
