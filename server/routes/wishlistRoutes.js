const express = require('express');
const router = express.Router();
const { wishlistController } = require('../controllers');

// API to add an item to the wishlist new update now
router.post('/add', wishlistController.addToWishlist);

// API to update an item in the wishlist
router.put('/update/:job_id', wishlistController.updateWishlistItem);

// API to delete an item from the wishlist 
router.delete('/delete', wishlistController.deleteFromWishlist);

// API to check if a job_id exists in the wishlist 
router.get('/check', wishlistController.checkJobIdInWishlist);

// API to get all wishlist items for a specific user
router.get('/all', wishlistController.getAllWishlistItems);

module.exports = router;
