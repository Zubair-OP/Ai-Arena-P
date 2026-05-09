const express = require('express');
const router = express.Router();
const { query } = require('../controllers/arenaController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.post('/query', query);

module.exports = router;
