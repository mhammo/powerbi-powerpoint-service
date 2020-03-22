const puppeteer = require('puppeteer');
const Jimp = require('jimp');
const fs = require('fs-extra');
const PPTX = require('pptxgenjs');
const debug = require('debug')('PROJECT:puppeteer');
const path = require('path');

/**
 * Gets a list of Power BI pages and initializes the puppeteer page for screenshot grabbing later on
 * @param {Object} browserPage The puppeteer page session for the Power BI Report
 */
async function getPowerBIPages(browserPage) {
    var pageJson = await browserPage.evaluate(
        await async function() { 
            var pages = await report.getPages()
            window.loading = 1; //intialise for use later on to determine when the report is finished loading
            report.on('rendered',function () { window.loading = 0 });
            return JSON.stringify(
                            pages.map(
                                    p => { return { 
                                        name: p.name, 
                                        displayName: p.displayName 
                                    } 
                                })
                            ) 
        }
    );
    return JSON.parse(pageJson);
}

/**
 * Renders the Power BI pages into screenshot images which can then be loaded into a PPTX file
 * @param {Object} browserPage The puppeteer page session for the Power BI Report
 * @param {Array<String>} pages A list of Power BI page IDs
 * @param {String} filename The output file name
 */
async function renderPowerBIPages(browserPage, pages, filename) {    
    let pageCount = 0;
    while (pageCount < pages.length)
    {
        debug(`Creating image ${filename}-${pageCount}.png`);
        await browserPage.evaluate(await async function(name)
            {
                window.loading = 1;
                report.setPage(name);
            }, pages[pageCount].name);
            
        await browserPage.waitForFunction(
                "window.loading === 0",
                {
                    polling: 20,
                    timeout: 30000
                }
            );

        await takeScreenshot(browserPage, `${filename}-${pageCount}`)
        debug(`Created image ${filename}-${pageCount}.png`)                           
    
        pageCount++
    }
    return pageCount;
}

/**
 * Takes a screenshot of the current page that the browser page is navigated to
 * @param {*} browserPage The puppeteer page session for the Power BI Report
 * @param {*} filename The output file name
 */
function takeScreenshot(browserPage, filename) {
    return browserPage.screenshot({ path: path.join('images', `${filename}.png`), fullPage: true });
}

/**
 * Turn the saved images into a PPTX file and save it
 * @param {*} filename The output file name
 * @param {*} pagecount The number of pages in this report
 */
async function createPPTX(filename, pagecount) {
  const promise = new Promise(async(resolve, reject) => {
    debug(`Creating PPTX ${filename}.pptx`);
    let pptx = await new PPTX();
    pptx.setLayout('LAYOUT_16x9');

    for (var i = 0; i < pagecount; i++)
    {
      debug(`Creating PPTX Page ${i}`);
      let slide = pptx.addNewSlide();
      await cropPowerBIImage(path.join('images', `${filename}-${i}.png`));
      slide.addImage({
          x: 0,
          y: 0,
          w: 10,
          h: 5.625,
          path: path.join('images', `${filename}-${i}.png`)
      });        
    }    
    
    // pptxgenjs doesn't have in built support for promises,
    // and the callback which saves a file doesn't resolve at point of saving
    // so we're getting the byte stream and reverting to fs-extra instead
    pptx.save('http', (byteArray) => {
      fs.writeFile(path.join('downloads', filename + '.pptx'), byteArray)
        .then(resolve);
    });
  });

  return promise;
}

/**
 * Crops the borders off the Power BI report page image
 * @param {String} imagePath 
 */
async function cropPowerBIImage(imagePath) {
        const img = await Jimp.read(imagePath);
        
        const w = img.bitmap.width;
        const h = img.bitmap.height;// - 37;
        let lmargin = 0;

        img.scan(0,0,w/2,1, function (x,y,idx) {
            const r   = img.bitmap.data[ idx + 0 ];
            const g = img.bitmap.data[ idx + 1 ];
            const b  = img.bitmap.data[ idx + 2 ];
            
            if (r === 234 && g === 234 && b === 234 && x > lmargin)
                lmargin = x;
        });

        let rmargin = img.bitmap.width;

        img.scan(w/2,0,w,1, function (x,y,idx) {
            const r   = img.bitmap.data[ idx + 0 ];
            const g = img.bitmap.data[ idx + 1 ];
            const b  = img.bitmap.data[ idx + 2 ];
            
            if (r === 234 && g === 234 && b === 234 && x < rmargin)
                rmargin = x;
        });

        rmargin = rmargin - lmargin;
        img.crop(lmargin,0,rmargin,h)
                
        return img.write(imagePath);
}

const powerbiRender =  {};

/**
 * Renders a Power BI embedded report url into a PPTX file
 * @param {String} url The url of the Power BI embedded report you want to turn into a PPTX file
 * @param {String} filename The output name of the PPTX report 
 */
powerbiRender.createPowerPoint = async function (url, filename) {
  debug('Rendering report into PPTX at: ' + url);
  const browser = await puppeteer.launch();
  const browserPage = await browser.newPage();
  await browserPage.setViewport({ width: 2560, height: 1440 });

  
  await browserPage.goto(url, { waitUntil: 'networkidle2' });
  const pages = await getPowerBIPages(browserPage);
  const pageCount = await renderPowerBIPages(browserPage, pages, filename);
  await browser.close();  
  return createPPTX(filename, pageCount);
};

module.exports = powerbiRender;