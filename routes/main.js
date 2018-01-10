const router = require('express').Router();
const Supervisor = require('../models/supervisor');
const _ = require('lodash');
const {ProjectSubmit} = require('../models/proposals');
const passport = require('passport');
const randomstring = require('randomstring');
const passportConfig = require('../config/passport');
const RegisteredStudent = require('../models/registered_user');
// var template = require('../server/template');
// var upload = require('../server/upload');
const async = require('async');

router.get('/', (req, res, next) => {
    if(req.user){
        let user = req.user;
        ProjectSubmit.find({'_id': user.proposals}).then((projects) => {
            res.render('main/welcome', { title: 'Proposal Submit', projects: projects,
            errorMessage: req.flash('errors'),successMessage: req.flash('success')});            
        });
    }else{
        res.render('accounts/login-supervisor', { title: 'Login',
        errorMessage: req.flash('errors'),successMessage: req.flash('success')});
    }
});

// router.post('/',passport.authenticate('local-login', {
//     successRedirect: '/',
//     failureRedirect: '/',
//     failureFlash: true
// }));

router.get('/boards', (req, res, next) => {
   if(req.user){
       res.render('main/board', {title: 'Project Boards'});
   }else{
    res.render('accounts/login-supervisor', { title: 'Login'});
   }
});
router.get('/demo-proposal', (req,res,next) => {
    res.render('main/demo_proposal', {title: 'Submit Proposal'});
});

// router.get('/test', (req,res,next) => {
//     RegisteredStudent.find({}).then((registered) => {
//         res.send(registered);

//     });
// });


module.exports = router;