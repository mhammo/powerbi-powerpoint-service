const ReportFile = require('../models/ReportFile');
const powerbiClient = require('../services/powerbiClient');
const powerbiRender = require('../services/powerbiRender');
const debug = require('debug')('PROJECT:reports');
const fs = require('fs-extra')

const controller = {}

/**
 * Create a report file configuration, if one already exists with the same configuration then use that one
 */
controller.post = async(req, res) => {
  try {    
    let file = await ReportFile.findExisting(req.body).exec();

    if (!file)
      file = await ReportFile.saveReport(req.body);

    debug(JSON.stringify(file));
    res.json(file);
  }
  catch (err) {
    throw err;
  }
}

/**
 * Get an embedded version of the power BI report configuration
 */
controller.get = async(req, res) => {
  try {
    var file = await ReportFile.findOne({ _id: req.params.id }).exec();
    var embedData = await powerbiClient.getEmbedToken('report', file.groupId, file.reportId);
    res.render('index', 
      { 
        embedToken: embedData.token, 
        embedUrl: embedData.embedUrl,
        reportId: file.reportId, 
        filters: file.filters
      });
  }
  catch (err) {
    throw err;
  }
}

/**
 * Download the report as a PPTX file (generated using puppeteer)
 */
controller.getPPTX = async(req, res) => {
  try {
    const reportFile = await ReportFile.findOne({ _id: req.params.id }).exec();

    if (!reportFile) {
      res.status(404).send('No report file was found under that ID.');
    }      

    if (!reportFile.filePath) {
      const url = req.protocol + '://' + req.get('host') + req.originalUrl.replace('/download', '');
      const file = req.params.id + '_' + (+ new Date());
      await powerbiRender.createPowerPoint(url, file);  

      reportFile.filePath = 'downloads\\' + file + '.pptx';
      await reportFile.save();

      const files = await fs.readdir('images');
      const images = files.filter(fn => fn.startsWith(file));
      for (let i = 0; i < images.length; i++){
        await fs.unlink('images\\' + images[i]);
      }
    }

    res.download(reportFile.filePath); 
  }
  catch(err) {
    throw err;
  }   
}

module.exports = controller;