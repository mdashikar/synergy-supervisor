const mongoose = require('mongoose');
const bycrpt = require('bcrypt-nodejs');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const SupervisorSchema = new Schema ({
    email: {type:String, unique: true, lowercase: true},
    name: String,
    password: String,
    username: {type: String, unique: true, lowercase:true},
    proposals: [{
        type: String
    }],
    boards: [{
        type: String,
        list: [{
            id: Schema.Types.ObjectId,
            name: { type: String, trim: true},
            discription: { type: String, trim: true},
            labels: [{
                begining : false,
                inprogress: false,
                completed: false
            }],
            dueDate: new Date,
            comments: [{
                id: Schema.Types.ObjectId,
                commentBody: String
            }]

        }]
    }],
    secretToken : {type: String},
    resetPasswordToken : {type : String},
    resetPasswordExpires : {type : Date}
});


SupervisorSchema.pre('save', function(next){
    var supervisor = this;
    if(!supervisor.isModified('password')) return next();
    if(supervisor.password){
        bycrpt.genSalt(10, function(err, salt){
            if(err) return next(err);
            bycrpt.hash(supervisor.password, salt, null, function(err, hash){
                if(err) return next();
                supervisor.password = hash;
                next(err);
            })
        })
    }
});


SupervisorSchema.methods.comparePassword = function(password){
    return bycrpt.compareSync(password, this.password);
}

module.exports = mongoose.model('Supervisor', SupervisorSchema);