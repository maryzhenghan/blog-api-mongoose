'use strict';

const mongoose = require('mongoose');

// schema to represent a blog post
const blogPost = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
  }
}, {timestamps: true});


// virtual for author full name
blogPost.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim()
});


// instance method for outputting something different than what's in db
blogPost.methods.serialize = function() {
  return {
    title: this.title,
    content: this.content,
    author: this.authorName,
    created: this.createdAt
  };
}


// make call to model
const Blog = mongoose.model('Blog', blogPost, 'seed-data');

module.exports = {Blog};