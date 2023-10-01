const chatRoom = require('../models/chat-room');

module.exports.getChatRoom = async (req, reply) => {
	try {
		const rooms = await chatRoom.find();
		return rooms;
	} catch (err) {
		throw err;
	}
};