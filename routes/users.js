const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: './public/imagesUser/'});
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // đi theo pasport
const { check, validationResult } = require('express-validator'); // kiểm tra nhập

let User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{title:'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title:'Login'});
});

router.get('/logout', (req, res, next) =>{
  req.logOut();
  // req.flash('success', 'You are now logged out')
  res.redirect('/users/login');
})
 
router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login',
                                   failureFlash: 'Invalid username or password'}), // hình như flash luôn ở đầu trang
  function(req, res) {
    // req.flash('success', 'You are now logged in');
    res.redirect('/');
});

// sử dụng pasport 
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});
// check login , nếu thêm tên 'local', trc new thì local chính là tên trên methot post
passport.use('local',new LocalStrategy(function(username, password, done){ // done là callback nhận err từ db
  User.getUserByUsername(username, function(err, user){ // tương tự hàm findOne lấy username 
    if(err) throw err; // hoặc return done(err); -> như nhau
    if(!user){
      return done(null, false, {message: 'Unknown User'});  // gọi cback done-> lấy dữ liệu err -> đang = null, user đang = false + dlieu thêm 
    }
    // đối chiếu pw
    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);  
      } else {
        return done(null, false, {message:'Invalid Password'});
      }
    });
  });
}));

router.post('/register', upload.single('profileimage'),
  [
    check('name','Name field is required').not().isEmpty(),
    check('email','Email field is required').notEmpty(),
    check('email','Email is not valid').isEmail(),
    check('username','Username field is required').not().isEmpty(),
    check('password','Password field is required').not().isEmpty(),
  ],
  function(req, res, next) {
    let newUser = new User({
      name : req.body.name,
      email : req.body.email,
      username : req.body.username,
      password : req.body.password,
      password2 : req.body.password2,
      profileimage : req.file != null ? req.file.filename : null,
    });
    // Form Validator
    check('password2','Passwords do not match').equals(req.body.password);

    // Check Errors
    const errors = validationResult(req);

    if(!errors.isEmpty()){
      return res.render('register', {
        errors: errors.array()
      });
    }
    User.createUser(newUser, function(err, user){
      if(err) throw err;
      // console.log(user);
    });
    
    req.flash('success', 'You are now registered and can login');

    res.location('/');
    res.redirect('/');
    //}
  });



module.exports = router;
