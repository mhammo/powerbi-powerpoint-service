const fs = require('fs-extra')
const reportHelper = {};

async function checkFileExists(filepath){
    let flag = true;
    try{
      await fs.access(filepath, fs.F_OK);
    }catch(e){
      flag = false;
    }
    return flag;
  }

reportHelper.checkReportFileExists = async function (filepath){
    if (!filepath)
        return false;

    return await checkFileExists(filepath);
  }

reportHelper.generateFileName = id => id + '_' + (+ new Date());

reportHelper.removeImageFiles = async function (fileName) {
    const files = await fs.readdir('images');
    const images = files.filter(fn => fn.startsWith(fileName));
    for (let i = 0; i < images.length; i++){
        await fs.unlink(path.join('images', images[i]));
    }
}

module.exports = reportHelper;