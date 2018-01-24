const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ListSchema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'Supervisor'},
    content: String,
    createdAt: { type: Date, default: Date.now}
});

module.exports = mongoose.model('List', ListSchema);