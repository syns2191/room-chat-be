const mongoose =  require('mongoose');
const { Schema } = mongoose;

const chatRoomschema = new mongoose.Schema({
	roomId: String,
    roomName: String,
    participants: [String]
});

module.exports = mongoose.model('ChatRoom', chatRoomschema);