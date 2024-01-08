const Wishlist = require('../models/wishlist');

const getWishlist = async (req, res) => {
  try {
    // Get user's wishlist items from the database
    const wishlist = await Wishlist.find({ userId: req.userId });
    res.status(200).json({ wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { item } = req.body;

    // Add item to user's wishlist in the database
    const newWishlistItem = new Wishlist({ userId: req.userId, item });
    await newWishlistItem.save();

    res.status(201).json({ message: 'Item added to wishlist successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const itemId = req.params.id;

    // Remove item from user's wishlist in the database
    await Wishlist.findOneAndDelete({ _id: itemId, userId: req.userId });

    res.status(200).json({ message: 'Item removed from wishlist successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
