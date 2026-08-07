const BlogPost = require('../models/BlogPost');

exports.getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await BlogPost.find({ published: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch blogs' });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await BlogPost.findOne({ slug: req.params.slug, published: true });
    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch blog' });
  }
};

// Admin routes (mocking auth for now)
exports.createBlog = async (req, res) => {
  try {
    const blog = new BlogPost(req.body);
    await blog.save();
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ success: false, error: 'Failed to create blog' });
  }
};
