const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => {
    console.log('BROWSER ERROR:', error.message);
    console.log('STACK:', error.stack);
  });
  page.on('requestfailed', request => console.log('BROWSER REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log("Navigating to http://localhost:3000...");
  try {
    await page.goto('http://localhost:3000');
    console.log("Waiting for 10 seconds to see if loading screen is stuck...");
    await new Promise(r => setTimeout(r, 10000));
  } catch(e) {
    console.log("Error navigating:", e);
  }
  
  await browser.close();
  console.log("Done.");
})();
