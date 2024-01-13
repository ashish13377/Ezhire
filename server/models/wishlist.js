const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  job_id: { type: String, required: true },
  employer_logo: { type: String, required: true },
  job_title : { type: String, required: true },
  job_employment_type : { type: String, required: true },
  data: [{ type: Object, required: true }],
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
