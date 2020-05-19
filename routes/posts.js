const express = require('express')
const router = express.Router();
// const multer = require('multer');
// const upload = multer({dest: './public/images/'});
const { check, validationResult } = require('express-validator'); // check user nhập liệu

// sử dụng để get db lúc sau push cmt
let mongo =require('mongodb');
let db = require('monk')('localhost/nodejsAuth');

let Post = require('../models/post');
let Category = require('../models/category');

const imageMimeType = ['image/png', 'image/jpeg', 'image/gif'];

// All Posts Route / async là không đồng bộ / await tạm thời dùng async 
router.get('/', async (req, res) => {
  let query = Post.find({});
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('createAt', req.query.publishedBefore) // lte: nhỏ hơn hoặc bằng
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('createAt', req.query.publishedAfter) //gte: lớn hơn hoặc bằng
  }
  try {
    const posts = await query.exec(); // thực hiện promise -> db con của mongo, để tạm thời
    res.render('posts/post', {
      posts: posts,
      searchOptions: req.query
    })
  } catch(error) {
    console.error(error);
    res.redirect('/')
  }
})

// New Post
router.get('/add', async (req, res, post) => {
  renderNewPage(res, new Post())
})

// Add Post
router.post('/', // upload.single('mainimage'),
  // [
  //   check('title','Title field is required').not().isEmpty(),
  //   check('body','Body field is required').not().isEmpty()
  // ],
  async function (req, res, next){
    const post = new Post({
      title: req.body.title,
      category: req.body.category,
      body: req.body.body,
      author: req.body.author,
      // mainimage: req.file != null ? req.file.filename : null,
    });
    saveCover(post, req.body.mainimage);
    // Check Errors
    // const errors = validationResult(req);
    // let categories = await Category.find({});
    // const params = {
    //   categories: categories,
    // }
    // if(!errors.isEmpty()){
    //   res.render('posts/add', params,{
    //     errors: errors.array()
    //   });
    // }
    try{
      const newPost = await post.save();
      res.redirect(`posts/${newPost.id}`);
      // res.redirect('/posts');
    } catch(error){
      console.error(error);
      renderNewPage(res, post, true)
    }

  });

// Show Post Route
router.get('/:id',async (req, res) => {
  try{
    const post = await Post.findById(req.params.id)
                            .populate('category') // thay category id thành tên category
                            .exec() // thực hiện 1 truy vấn đã chuẩn bị trước -> trả vè true nếu thực hiện được
    // console.log(post);
    res.render('posts/show', {
      post: post
    })
  }catch(error){
    console.error(error);
    res.redirect('/posts')
  }
})

// AddComment
router.post('/:id', 
  function (req, res, next){
    let postid =req.body.postid;
    const comment= {
      name: req.body.name,
      email: req.body.email,
      body: req.body.body,
      commentDate: new Date()
    };
    
    try{
      let posts = db.get('posts');
      posts.update(
        {
          _id: postid
        }, 
        {
          "$push":{
            comments: comment 
          }
        }, (err) => {
        if(err) throw  err
        else{
          req.flash('success', "Comment Success");
          res.location('/posts/'+ postid);
          res.redirect('/posts/'+ postid);
        }
      })
    } catch(error){
      console.error(error); 
    }

  });

// Edit Post Route
router.get('/:id/edit', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    renderEditPage(res, post);
  } catch(error) {
    console.error(error);
    res.redirect('/posts');
  }
})

// Update Post Route
router.put('/:id', async (req, res) => {
  let post
  try {
    post = await Post.findById(req.params.id)
    post.title = req.body.title
    post.category = req.body.category
    // post.publishDate = new Date(req.body.publishDate)
    post.author = req.body.author
    post.body = req.body.body
    if (req.body.mainimage != null && req.body.mainimage !== '') {
      saveCover(post, req.body.mainimage)
    }
    await post.save()
    res.redirect(`/posts/${post.id}`)
  } catch(error) {
    console.error(error);
    if (post != null) {
      renderEditPage(res, post, true)
    } else {
      res.redirect('/posts')
    }
  }
})
 
// Delete Post Page
router.delete('/:id', async (req, res) => {
  let post;
  try {
    post = await Post.findById(req.params.id)
    await post.remove()
    res.redirect('/posts');
    // return false;
  } catch {
    if (post != null) {
      res.render('posts/show', {
        post: post,
        errorMessage: 'Could not remove post'
      })
    } else {
      res.redirect('/post') 
    }
  }
})

async function renderNewPage(res, post, hasError = false) {
  renderFormPage(res, post, 'add', hasError)
}

async function renderEditPage(res, post, hasError = false) {
  renderFormPage(res, post, 'edit', hasError)
}

async function renderFormPage(res, post, form, hasError = false) {
  try {
    const categories = await Category.find({})  // tìm kiếm categorys để thêm vào options
    const params = {
      categories: categories,
      post: post
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Post'
      } else {
        params.errorMessage = 'Error Creating Post'
      }
    }
    res.render(`posts/${form}`, params)
  } catch {
    res.redirect('/posts')
  }
}

function saveCover(post, coverEncoded){ // coverEncoded truyền image - file
  if( coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded); // ghi vào json dạng string
  if( cover != null && imageMimeType.includes(cover.type)){
    post.coverImage = new Buffer.from(cover.data, 'base64');
    post.coverImageType = cover.type;
  }
}

// const imageMimeType = ['image/png', 'image/jpeg', 'image/gif'];  ở bên trên
module.exports = router;