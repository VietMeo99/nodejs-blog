const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// router.get('/', ensureAuthenticated, (req, res, next) => {
//   res.render('index', {
//     title: "Members"
//   });
// })
router.get('/', (req, res, next) => {
  res.render('index');
})

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){ // kiểm tra xem nguoif dùng có đang các thực -> true nếu user login
    return next();
  }
  res.redirect('/users/login');
}
// function checkAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next()
//   }

//   res.redirect('/login')
// }

// function checkNotAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return res.redirect('/')
//   }
//   next()
// }

module.exports = router;