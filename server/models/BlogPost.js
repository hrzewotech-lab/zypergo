const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String, // Can store HTML or Markdown
    required: true
  },
  author: {
    type: String,
    default: 'ZyperGo Team'
  },
  published: {
    type: Boolean,
    default: false
  },
  coverImage: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
