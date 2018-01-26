const mongoose = require('mongoose');
const bycrpt = require('bcrypt-nodejs');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const TodoSchema = new Schema ({
    
    label: String,
    done: {
        type : Boolean,
        default : true
    }
});

module.exports = mongoose.model('Todo', TodoSchema);