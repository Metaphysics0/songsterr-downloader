const puppeteer = require('puppeteer'); // v23.0.0 or later

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const timeout = 5000;
  page.setDefaultTimeout(timeout);

  {
    const targetPage = page;
    await targetPage.setViewport({
      width: 1512,
      height: 229
    });
  }
  {
    const targetPage = page;
    await targetPage.goto(
      'https://www.songsterr.com/a/wsa/metallica-master-of-puppets-tab-s455118'
    );
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('::-p-aria(MORE)'),
      targetPage.locator('#c-more > button'),
      targetPage.locator('::-p-xpath(//*[@id=\\"control-dots\\"])'),
      targetPage.locator(':scope >>> #c-more > button')
    ])
      .setTimeout(timeout)
      .click({
        offset: {
          x: 35.0390625,
          y: 31
        }
      });
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('::-p-aria(EXPORT)'),
      targetPage.locator('#controlinpopup-export'),
      targetPage.locator('::-p-xpath(//*[@id=\\"controlinpopup-export\\"])'),
      targetPage.locator(':scope >>> #controlinpopup-export')
    ])
      .setTimeout(timeout)
      .click({
        offset: {
          x: 55.671875,
          y: 28
        }
      });
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator(
        '::-p-aria(Guitar Pro) >>>> ::-p-aria([role=\\"generic\\"])'
      ),
      targetPage.locator('div.Bah4x > div:nth-of-type(2) span'),
      targetPage.locator(
        '::-p-xpath(//*[@id=\\"export_modal\\"]/div/div[2]/div[2]/button/span)'
      ),
      targetPage.locator(':scope >>> div.Bah4x > div:nth-of-type(2) span'),
      targetPage.locator('::-p-text(Guitar Pro)')
    ])
      .setTimeout(timeout)
      .click({
        offset: {
          x: 29.46875,
          y: 10.40625
        }
      });
  }

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
