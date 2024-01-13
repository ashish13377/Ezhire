const Wishlist = require('../models/wishlist');

// Controller to add an item to the wishlist
const addToWishlist = async (req, res) => {
  try {
    const { userId, job_id, employer_logo, job_title, job_employment_type, data } = req.body;
    
    const wishlistItem = new Wishlist({
      userId,
      job_id,
      employer_logo,
      job_title,
      job_employment_type,
      data,
    });

    await wishlistItem.save();
    res.status(200).json({ success: true, message: 'Item added to wishlist successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Controller to update an item in the wishlist
const updateWishlistItem = async (req, res) => {
  try {
    const { job_id } = req.params;
    const updatedData = req.body;

    const result = await Wishlist.updateOne({ job_id }, { $set: { data: updatedData } });

    if (result.nModified > 0) {
      res.json({ success: true, message: 'Item updated successfully' });
    } else {
      res.json({ success: false, message: 'Item not found or not updated' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Controller to delete an item from the wishlist
const deleteFromWishlist = async (req, res) => {
  try {
    const { job_id } = req.query;

    const result = await Wishlist.deleteOne({ job_id });

    if (result.deletedCount > 0) {
      res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } else {
      res.status(200).json({ success: false, message: 'Item not found or not deleted' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Controller to check if a job_id exists in the wishlist
const checkJobIdInWishlist = async (req, res) => {
  try {
    const { userId, job_id } = req.query;

    const item = await Wishlist.findOne({ userId, job_id });

    if (item) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Controller to get all wishlist items for a specific user
const getAllWishlistItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlistItems = await Wishlist.find({ userId });
    
    res.json({ wishlistItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  addToWishlist,
  updateWishlistItem,
  deleteFromWishlist,
  checkJobIdInWishlist,
  getAllWishlistItems,
};