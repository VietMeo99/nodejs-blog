const mongoose = require('mongoose');

let PostSchema = mongoose.Schema({
  title: {
    type: String,
    require: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Category'
  },
  body: {
    type: String,
    require: true
  },
  createAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  author:{
    type: String,
    require: true
  },
  // mainimage:{
	// 	type: String
  // }
  coverImage: {
    type: Buffer, // data tạm thời thường lưu ở bộ nhớ Ram
    required: true
  },
  coverImageType: {
    type: String,
    required: true
  },
  comments: [{
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    commentDate: {
      type: Date
    }
  }]
})

// const path = require('path'); -> bỏ rồi

// const coverImageBasePath = 'uploads/bookCovers'; -> bỏ

// tạo key ảo để hiện thị ảnh ở trang all books
// chú ý để xuất hiện ảnh trong phần create phải tạo filepond trong public/js/fileupload.js / nhùng filepond vào ở thẻ head
PostSchema.virtual('coverImagePath').get(function(){
  if( this.coverImage != null && this.coverImageType != null ) {
    // return path.join('/', coverImageBasePath, this.coverImageName)
    return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
  }
})


let Post = module.exports = mongoose.model('Post', PostSchema);