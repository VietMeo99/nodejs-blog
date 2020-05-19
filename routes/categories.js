const express = require('express'); 
const router = express.Router();


const Category = require('../models/category'); // = author
const Post = require('../models/post');


// All Categories Route
router.get('/', async (req, res) => {
  
  let searchOptions = {}
  if( req.query.category != null && req.query.category !== ''){
    searchOptions.name = new RegExp(req.query.category, 'i') // tìm kiếm, i để ko phân biệt chữ hoa chữ thường
  }
  try {
    const categories = await Category.find(searchOptions)
    res.render('categories/index', {
      categories: categories,
      searchOptions: req.query
    })
  } catch{
    res.redirect('/posts');
  }
})

//New Category Route
router.get('/new', (req, res) => {
  res.render('categories/new', {
    category: new Category()
  })
})

// Create Category Route
router.post('/', async (req, res) => { 
  const category = new Category({
    name: req.body.category
  })
  try {
    const newCategory = await category.save();
    // res.redirect(`/categories/${newCategory.id}`)
    // res.redirect('/posts/add');
    res.redirect('/posts/add');
  } catch{ // nếu không nhập thêm tên thì errMess
    res.render('categories/new', {
      errorMessage: 'Error creating category'
    })
  }
})

//Show Categories Route
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    const posts = await Post.find({ category: category.id}).exec();   // tìm kiếm sách dựa vào id category
    // res.render('categories/show', {
    //   category: category,
    //   postsByCategory: posts
    // })
    res.render('posts/post', {
      posts: posts,
      searchOptions: req.query 
    })
    // res.send('category');
  } catch(err) {
    console.log(err);
    res.redirect('/');
  }
})

// Edit
router.get('/:id/edit', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    res.render('categories/edit', {
      category: category
    })
  } catch{
    res.redirect('/categories');
  }
})

// Update Category Route
router.put('/:id', async (req, res) => {
  let category;
  try {
    category = await Category.findById(req.params.id);
    category.name = req.body.category;
    await category.save();
    res.redirect(`/categories/${category.id}`);
  } catch{ // nếu không nhập thêm tên thì errMess
    if( category == null){
      res.redirect('/');
    } else {
      res.render('categories/edit', {
        category: category,
        errorMessage: 'Error updating Category'
      })
    }
  }
})

// Delete Category Route
router.delete('/:id', async (req, res) => {
  let category;
  try {
    category = await Category.findById(req.params.id);
    await category.remove();
    res.redirect('/categories');
  } catch(err){
    console.error(err);
    // if( category == null){
    //   res.redirect('/categories');
    // } else {
    //   res.redirect(`/categories/${category.id}`);
    // }
    res.redirect('/categories');
  }
})

module.exports = router;