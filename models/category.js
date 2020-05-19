const mongoose = require('mongoose');

const Post = require('./post');

// biến lưu trong db
const  CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

// không cho remove khi có nhiều sách
CategorySchema.pre('remove', function(next){
  Post.find({ category: this.id}, (err, posts) => {
    if(err){
      next(err);
    } else if( posts.length > 0){
      next(new Error('this Category has posts still'));
    } else{
      next();
    }
  })
})

module.exports = mongoose.model('Category', CategorySchema, 'categories'); // Biến dk trả về, tham số lưu, Tên thư mục