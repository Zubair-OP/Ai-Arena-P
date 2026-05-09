const express = require('express');
const router = express.Router();
const { uploadFile, queryWithFile } = require('../controllers/ragController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadFile);
router.post('/query-with-file', queryWithFile);

module.exports = router;
