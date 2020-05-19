if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

const express = require('express');
const app = express();
// const expressLayouts = require('express-ejs-layouts');// sử dụng layout
const bodyParser = require('body-parser');
const methodOverride = require('method-override');// để ghi đè các method put
const cookieParser = require('cookie-parser')  // user cookie
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
// const { check, validationResult } = require('express-validator');
const flash = require('connect-flash');

const indexRouter = require('./routes/index');
const userRouter  = require('./routes/users');
const postRouter = require('./routes/posts');
const categoryRouter = require('./routes/categories');

app.locals.moment = require('moment'); // lấy ngày tháng
app.locals.truncateText = function(text, length){
  let truncatedText = text.substring(0, length);
  return truncatedText;
}

// app.set('view engine', 'ejs'); // để sử dụng ejs -> là 1 view engine
app.set('view engine', 'pug');

app.set('views', __dirname + '/views');  // __dirname luôn là thư mục tệp hiện tại, còn ./ dịch thư mục khi require
// app.set('layout', 'layouts/layout');
// app.use(expressLayouts);
app.use(methodOverride('_method'));
app.use(express.static( 'public'));
app.use(bodyParser.json()); // for parsing application/json, trả về func khi func là đối số, giống middleware
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}));// extened: mở rộng -> phân tích ứng dụng
app.use(cookieParser(process.env.SESSION_SECRET)) // dùng cho signed cookie

// Handle Sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true, 
  resave: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Validator
// app.use(expressValidator(){
//   errorFormatter: function(param, msg, value) {
//       var namespace = param.split('.')
//       , root    = namespace.shift()
//       , formParam = root;

//     while(namespace.length) {
//       formParam += '[' + namespace.shift() + ']';
//     }
//     return {
//       param : formParam,
//       msg   : msg,
//       value : value
//     };
//   }
// });
// const errors = validationResult(req);
// app.use(expressValidator());

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// sử dụng user ở mọi trang
app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
})

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { 
  useNewUrlParser: true, useUnifiedTopology: true , useCreateIndex: true })
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log("Connected to Mongoose"));

app.use('/', indexRouter);
app.use('/users',  userRouter);
app.use('/posts', postRouter);
app.use('/categories', categoryRouter);
app.use('/posts', postRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// function checkNotAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return res.redirect('/')
//   }
//   next()
// }

// app.listen(3000, () => console.log('Example app listening on port 3000'))
app.listen(process.env.PORT || 3000, function(){
  console.log('Listening to port 3000');
  
});