const mongoose =  require('mongoose');
const { Schema } = mongoose;
const usersSchema = new mongoose.Schema({
	username: String
});

module.exports = mongoose.model('Users', usersSchema);