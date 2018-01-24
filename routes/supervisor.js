const router = require('express').Router();
const passport = require('passport');
const randomstring = require('randomstring');
const passportConfig = require('../config/passport');
const Supervisor = require('../models/supervisor');
const Invite = require('../models/invite');
const mailer = require('../misc/mailer');
var async = require('async');
var crypto = require('crypto');
algorithm = 'aes-256-ctr',
password = 'd6F3Efeq';
var decryptedEmail;
var emailId;
var secretToken;

var value = "hi";

router.get('/signup-supervisor/:secretToken/:email', (req, res, next) => {
        
        secretToken = req.params.secretToken;
        emailId = req.params.email;
        if(secretToken != value)
        {
            var invite = Invite.findOne({'secretToken' : secretToken.trim()}).then((invite) => 
            {      
                    if(!invite)
                    {
                        //req.flash('errors', 'No user found');
                        //res.redirect('/users/verify-error');
                        res.render('errors');
                        return;
                    }
                    
                    function decrypt(text){
                      var decipher = crypto.createDecipher(algorithm,password)
                      var dec = decipher.update(text,'hex','utf8')
                      dec += decipher.final('utf8');
                      return dec;
                    }
                    decryptedEmail = decrypt(emailId);
            
                    
                    invite.secretToken = '';
                    invite.save();
                    res.render('accounts/signup-supervisor', {errorMessage : req.flash('errors')});
                    
                    value = secretToken;
                
            });
        }
        else
        {
            //req.flash('errors','Link already used');
            //res.redirect('/users/login');
            res.render('errors');
        }
    })
router.post('/signup-supervisor',(req, res, next) => 
    {
        Supervisor.findOne({email: req.body.email}, function(err, existingUser){
           if(existingUser){
               req.flash('errors', 'Email address already exists try different one!!');
               res.redirect('/signup-supervisor');
               
           }
           else{
                var supervisor = new Supervisor();
                supervisor.name = req.body.name;
                supervisor.email = decryptedEmail;
                supervisor.username = req.body.username;
                supervisor.password = req.body.password;  
                //user.secretToken = req.body.secretToken;            
                supervisor.save(function(err){
                    // req.logIn(user, function(err){
                        if(err) return next(err);
                        res.redirect('/');
                    // });
                });
                console.log('Signup data uploaded');
           }
       });
    //    Supervisor.findOne({username: req.body.username}, function(err, existingUser){
    //     if(existingUser){
    //         req.flash('errors', 'Username already exists try different one!!');
    //         res.redirect('/signup-supervisor');
    //     }else{
    //         var supervisor = new Supervisor();
    //         supervisor.name = req.body.name;
    //         supervisor.email = req.body.email;
    //         supervisor.username = req.body.username;
    //         supervisor.password = req.body.password;  
    //         //user.secretToken = req.body.secretToken;            
    //         supervisor.save(function(err){
    //             // req.logIn(user, function(err){
    //                 if(err) return next(err);
    //                 res.redirect('/login-supervisor');
    //             // });
    //         });
    //     }
    // });
    // User.findOne({secretToken: req.body.secretToken}, function(err, existingUser){
    //     if(existingUser){
    //         req.flash('errors', 'You are not eligible to register here');
    //         res.redirect('/signup');
    //     }else{
    //          var user = new User();
    //          user.name = req.body.name;
    //          user.email = req.body.email;
    //          user.username = req.body.username;
    //          user.password = req.body.password;  
    //          user.secretToken = req.body.secretToken;            
    //          user.save(function(err){
    //              // req.logIn(user, function(err){
    //                  if(err) return next(err);
    //                  res.redirect('/');
    //              // });
    //          });
    //     }
    // });

    });

router.route('/login-supervisor')
    .get( (req, res, next) => {
        if(req.supervisor) res.redirect('/');
        res.render('accounts/login-supervisor', {errorMessage: req.flash('errors'),successMessage: req.flash('success')});
    })
    .post(passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login-supervisor',
        failureFlash: true
    }));

router.get('/logout-supervisor', (req,res, next) => {
    req.logout();
    res.redirect('/login-supervisor');
});


//Forgot-password

router.post('/forgot-password', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        Supervisor.findOne({ email: req.body.emailForgot }, function(err, supervisor) {
          if (!supervisor) {
            req.flash('errors', 'No account with that email address exists.');
            return res.redirect('/login-supervisor');
          }
  
          supervisor.resetPasswordToken = token;
          supervisor.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          supervisor.save(function(err) {
            done(err, token, supervisor);
          });
        });
      },
      function(token, supervisor, done) {
        const html = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/reset-password/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n';
        
    
      

        mailer.sendEmail('admin@synergy.com',req.body.emailForgot,'Reset password',html);
       
        req.flash('success', 'A reset-password mail has been sent to your email address.Check it out!');
        res.redirect('/login-supervisor');

        
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/login-supervisor');
    });
  });

//reset password

router.get('/reset-password/:token', function(req, res) {
     Supervisor.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, supervisor) {
    
        
      if (!supervisor) {
        req.flash('errors', 'No user with this email');
       // console.log("inside reset password get");
        return res.redirect('/login-supervisor');
      }
      res.render('accounts/reset-password', {
        supervisor : supervisor
      });
   
    });
  });
 router.post('/reset-password/:token', function(req, res) {
    async.waterfall([
      function(done) {
        Supervisor.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, supervisor) {
      //  User.findOne({resetPasswordToken: req.params.token}, function(err, user) {
          if (!supervisor) {
            req.flash('errors', 'Password reset token is invalid or has expired.');
            return res.redirect('/login-supervisor');
          }
  
          supervisor.password = req.body.password;
          supervisor.resetPasswordToken = undefined;
          supervisor.resetPasswordExpires = undefined;
  
          supervisor.save(function(err) {
            req.logIn(supervisor, function(err) {
              done(err, supervisor);
            });
          });
        });
      },
      function(supervisor, done) {
        const html = 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + supervisor.email + ' has just been changed.\n'
        
        mailer.sendEmail('admin@synergy.com',supervisor.email,'Password change confirmation',html);
        res.redirect('/login-supervisor');
        
      }
    ], function(err) {
      res.redirect('/login-supervisor');
    });
  });

  var value;
  router.get('/profile/:id', (req, res, next) => {
      value = req.params.id;
      res.render('accounts/profile', { title: 'Profile' , errorMessage: req.flash('error')});
  });
  router.post('/edit-name/:id', (req,res,next) => {
      var editedName = req.body.name;
      var id = req.params.id;
      console.log(id);
      Supervisor.findOne({ _id: id }, function (err, doc){
          doc.name = editedName;
          doc.save();
      });
     // res.render('main/welcome', { title: 'Profile' });
     res.redirect('/');
  });
  
  
  
  router.post('/edit-password/:id' , function (req, res, next) {
      var id = req.params.id;
      var newpass = req.body.npassword;
      var newpassconfirm = req.body.cpassword;
      if (newpass != newpassconfirm) {
          req.flash('error','New password and confirm password did not match!');
         console.log("not same");
          res.redirect(`/profile/${id}`);
      }
      else
      {
          Supervisor.findOne({ _id: id }, function (err, doc){
              doc.password = newpass;
              doc.save(function(err){
                  if (err) { next(err) }
                  else {
                      res.redirect('/');
                  }
              });
          });
      }
      
      
  });

module.exports = router;