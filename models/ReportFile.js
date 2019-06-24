const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportFile = new Schema ({
  filePath: { type: String },
  reportId: { type: String, required: true },
  groupId: { type: String, required: true },
  username: { type: String },
  roles: { type: String },
  expired: { type: Boolean, required: true },
  filters: { type: String },
  dateCreated: { type: Date, required: true }
});

const model = mongoose.model('ReportFile', ReportFile)

// Define extension/override methods below

/**
 * Create a report file configuration object
 */
model.saveReport = function(data) {
  var newFile = new model({
    reportId: data.reportId,
    groupId: data.groupId,
    username: data.username,
    roles: data.roles,
    filters: data.filters,
    expired: data.expired ? data.expired : false,
    filePath: data.filePath,
    dateCreated: data.dateCreated ? Date.parse(data.dateCreated) : new Date()
  });
  
  return newFile.save();
}

/**
 * Find a report file configuration that has a report generated for it, which is valid
 */
model.findExisting = function(data) {
  return model.findOne({ 
    reportId: data.reportId, 
    groupId: data.groupId, 
    username: data.username, 
    roles: data.roles, 
    filters: data.filters, 
    expired: false,
    filePath: { $ne: null }
   });
}

module.exports = model;