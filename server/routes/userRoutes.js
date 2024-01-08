const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');

router.get('/profile', userController.getUserProfile);
router.put('/update-profile', userController.updateUserProfile);
router.delete('/delete-account', userController.deleteUser);

module.exports = router;
