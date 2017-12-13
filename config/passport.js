const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Supervisor = require('../models/supervisor');

passport.serializeUser(function(supervisor, done){
    done(null, supervisor.id);
});

passport.deserializeUser(function(id, done){
    Supervisor.findById(id, function(err, supervisor){
        done(err, supervisor);
    });
});

passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, username, password, done){
    Supervisor.findOne({username: username}, function(err, supervisor){
        if(err) return done(err);
        if(!supervisor) return done(null, false, req.flash('loginMessage', 'Opss! No user found.'));
        if(!supervisor.comparePassword(password)) return done(null, false, req.flash('loginMessage', 'Opss! Wrong password.'));

        return done(null, supervisor);
    });
}));