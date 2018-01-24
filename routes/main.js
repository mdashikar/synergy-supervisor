const router = require('express').Router();
const Supervisor = require('../models/supervisor');
const _ = require('lodash');
const {ProjectSubmit} = require('../models/proposals');
const RegisteredStudent = require('../models/registered_user');
// var template = require('../server/template');
// var upload = require('../server/upload');
const async = require('async');

router.get('/', (req, res, next) => {
    if(req.user){
        let user = req.user;
        ProjectSubmit.find({'_id': user.proposals}).then((projects) => {
            res.render('main/welcome', { title: 'Proposal Submit', projects: projects});            
        });
    }else{
        res.render('accounts/login-supervisor', { title: 'Login'});
    }
});

router.get('/test', (req, res) => {
    res.render('test');
});
router.get('/boards', (req, res, next) => {
   if(req.user){
       res.render('main/boards', {title: 'Project Boards'});
   }else{
    res.render('accounts/login-supervisor', { title: 'Login'});
   }
});


router.route('/submit-proposal')
    .get( (req, res, next) => {
        res.render('main/proposal_form', { title: 'Proposal Submit'});
    })
    .post((req, res, next) => {
        var projectSubmit = new ProjectSubmit({
            projectName: req.body.projectName,
            projectType:req.body.projectType,
            projectTools:req.body.projectTools,
            projectSummary:req.body.projectSummary,
            memberName:req.body.memberName,
            memberEmail:req.body.memberEmail,
            memberId: req.body.memberId,
            
            
        });
        RegisteredStudent.findOne({student_id: projectSubmit.memberId}, function(err, registered)                                                                 
        {
            
          //  console.log(registered.student_id +" "+ projectSubmit.memberId);
            if(!registered)
            {
                return res.send(`${projectSubmit.memberId} is not registered`);
            }
            projectSubmit.save().then((doc) => {
                //res.send(doc);
              //  res.status(200).send('welcome', doc);
                res.redirect('/submit-proposal');
                console.log('In saving page');
               //res.render('projectList', doc);
           }, (e) => {
                res.status(400).send(e);
           });
       });
    });
router.get('/demo-proposal', (req,res,next) => {
    res.render('main/demo_proposal', {title: 'Submit Proposal'});
});



module.exports = router;