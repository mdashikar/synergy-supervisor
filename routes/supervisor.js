const router = require('express').Router();
const passport = require('passport');
const randomstring = require('randomstring');
const passportConfig = require('../config/passport');
const Supervisor = require('../models/supervisor');
const Invite = require('../models/invite');
//const mailer = require('../misc/mailer');

var value = "hi";

router.route('/signup-supervisor/:secretToken')
    .get( (req, res, next) => {
        
        const {secretToken} = req.params;
        if(secretToken != value)
        {
            var invite = Invite.findOne({'secretToken' : secretToken.trim()}).then((invite) => 
            {      
                    if(!invite)
                    {
                        req.flash('errors', 'No user found');
                        //res.redirect('/users/verify-error');
                        res.render('errors');
                        return;
                    }
            
                    
                    invite.secretToken = '';
                    invite.save();
                    res.render('accounts/signup-supervisor', {message : req.flash('errors')});
                    
                    value = secretToken;
                
            });
        }
        else
        {
            req.flash('errors','Link already used');
            //res.redirect('/users/login');
            res.render('errors');
        }
    })
    .post((req, res, next) => 
    {
        Supervisor.findOne({email: req.body.email}, function(err, existingUser){
           if(existingUser){
               req.flash('errors', 'Email address already exists try different one!!');
               res.redirect('/signup-supervisor');
               
           }
           else{
                var supervisor = new Supervisor();
                supervisor.name = req.body.name;
                supervisor.email = req.body.email;
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
        res.render('accounts/login-supervisor', {message: req.flash('loginMessage')});
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



module.exports = router;