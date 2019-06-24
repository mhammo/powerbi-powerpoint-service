const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports');

/* GET home page. */
router.get('/reports/:id?', reportsController.get);
router.post('/reports', reportsController.post);

/* POST download PPTX of report config. */
router.get('/reports/:id?/download', reportsController.getPPTX);

module.exports = router;
