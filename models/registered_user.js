var mongoose = require('mongoose');

var register_userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  student_id: {
          type: String,
          required: true
  },
  course_code : {
    type: String, required: true
  },
  created: {
      type: Date,
      default: Date.now
  }
});

var RegisteredStudent = mongoose.model('RegisteredStudent', register_userSchema);

module.exports = RegisteredStudent;