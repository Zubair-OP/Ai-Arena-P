const express = require('express');
const router = express.Router();
const {
  getAllConversations,
  createConversation,
  deleteConversation,
  getMessages,
} = require('../controllers/conversationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getAllConversations);
router.post('/', createConversation);
router.delete('/:id', deleteConversation);
router.get('/:id/messages', getMessages);

module.exports = router;
