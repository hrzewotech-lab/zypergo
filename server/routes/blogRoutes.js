const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Public routes
router.get('/', blogController.getPublishedBlogs);
router.get('/:slug', blogController.getBlogBySlug);

// Admin routes
router.post('/', blogController.createBlog); // Would be protected in prod

module.exports = router;
