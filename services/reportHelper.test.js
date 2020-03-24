const reportHelper = require('./reportHelper');
const fs = require('fs-extra');

const hasUTC = {
    asymmetricMatch: actual => actual.startsWith('id_') 
        && parseInt(actual.replace('id_', '')) > ((+new Date()) - 10000) 
  };

test('File name is generated with a UTC timestamp at the end', () => {
  expect(reportHelper.generateFileName('id')).toEqual(hasUTC);
});

test('Return true if file exists.', async() => {
  await fs.createFile("test.pptx")
  expect((await reportHelper.checkReportFileExists("test.pptx"))).toBe(true);
  await fs.unlink("test.pptx");
});

test('Return false if file doesn\'t exist.', async() => {
    expect((await reportHelper.checkReportFileExists("missing.pptx"))).toBe(false);
  });

test('Return false if filePath is null', async() => {
    expect((await reportHelper.checkReportFileExists(null))).toBe(false);
  });