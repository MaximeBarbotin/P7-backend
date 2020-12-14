// import ressources necessaires//
const mongoose = require('mongoose');

//mise en place des shema//
const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  userId: { type: String, required: true },
  likes: { type: Number, required: true, default: 0 },
  usersLiked: { type: Array, required: true, default: [] },
});

module.exports = mongoose.model('Post', postSchema);