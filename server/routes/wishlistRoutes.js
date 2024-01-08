const express = require('express');
const router = express.Router();
const { wishlistController } = require('../controllers');

router.get('/wishlist', wishlistController.getWishlist);
router.post('/wishlist/add', wishlistController.addToWishlist);
router.delete('/wishlist/remove/:id', wishlistController.removeFromWishlist);

module.exports = router;
