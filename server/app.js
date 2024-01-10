const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const axios = require('axios');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config(); // Load environment variables


const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Middleware
app.use(bodyParser.json());
app.use(express.json());
// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/wishlist', wishlistRoutes);

app.get('/search', async (req, res) => {
  try {
    const {
      query,
      page,
      employment_types,
      country,
      num_pages,
      date_posted,
      job_id,
    } = req.query;

    const queryParams = {
      ...(query && { query }),
      ...(page && { page }),
      ...(employment_types && { employment_types }),
      ...(country && { country }),
      ...(num_pages && { num_pages }),
      ...(date_posted && { date_posted }),
      ...(job_id && { job_id })
    };

    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: queryParams,
      headers: {
        'X-RapidAPI-Key': process.env.API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    };

    const response = await axios(options);
    res.json(response.data);
  } catch (error) {
    console.log(error.response.data);
    res.status(500).json(error.response.data);
  }
});

app.get('/job-details', async (req, res) => {
  try {
    const {
      query,
      page,
      employment_types,
      country,
      num_pages,
      date_posted,
      job_id,
    } = req.query;

    const queryParams = {
      ...(query && { query }),
      ...(page && { page }),
      ...(employment_types && { employment_types }),
      ...(country && { country }),
      ...(num_pages && { num_pages }),
      ...(date_posted && { date_posted }),
      ...(job_id && { job_id })

    };

    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/job-details',
      params: queryParams,
      headers: {
        'X-RapidAPI-Key': process.env.API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    };

    const response = await axios(options);
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.response.data);
  }
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure Multer to use Cloudinary as storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

// Define the upload route
app.post('/upload', upload.single('file'), (req, res) => {
  // Access the Cloudinary URL of the uploaded file
  const imageUrl = req.file.path;
  res.json({ imageUrl });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
