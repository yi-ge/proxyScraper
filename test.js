const ProxyVerifier = require('proxy-verifier');
const { parentPort, workerData } = require('worker_threads');

const checkIP = ipAddress => {
  return new Promise((resolve, reject) => {
    let split = ipAddress.split(':');
    let proxy = {
      ipAddress: split[0],
      port: split[1],
      protocols: ['http', 'https', 'socks4', 'socks5'],
    };

    ProxyVerifier.testAll(proxy, (error, result) => {
      if (error) {
        console.log('there would have been an error');
        resolve(false);
      } else if (result.anonymityLevel != null) {
        console.log('result: good', ipAddress);
        // ONLY INSTANCE OF GOOD RESULT
        resolve(true);
      } else {
        console.log('there would have been an error');
        resolve(false);
      }
    });
  });
};

let { list } = workerData;
for (let i = 0; i < list.length; i++) {
  (async () => {
    console.log(`${workerData.id} checking ${list[i]}`);
    let result = await checkIP(list[i]);
    console.log(`checked ${list[i]}, result is ${result}`);
    if (result) {
      parentPort.postMessage(list[i]);
    }
  })();
}

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

function chunkArray(myArray, chunk_size) {
  var results = [];

  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }

  return results;
}

scrape();
