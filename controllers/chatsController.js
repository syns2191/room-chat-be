const Users = require('../models/users');
const ChatRoom = require('../models/chat-room');
const Chats = require('../models/chats');


module.exports.initUserAndChatRoom = async (req, reply) => {
	try {
        const data = req.body;
        let room = await ChatRoom.findOne({
            roomId: data.roomid,
            participants: {
                $elemMatch:{"$in":[data.username], "$exists":true }
            }
        })
        let user;
        if (!room || !room._id) {
            room = await ChatRoom.findOneAndUpdate({
                roomId: data.roomid
            }, {
                $addToSet: {
                    participants: [data.username]
                }
            }, {upsert: true})

           user = await Users.create({
                username: data.username
            });
        } else {
            return reply.status(403).send({ ok: false, message: 'Username Already Taken!!!' })
        }
		
        if (!room) {
            room = await ChatRoom.findOne({roomId: data.roomid})
        }
		return {
            user: user.toJSON(),
            room: room.toJSON()
        };
	} catch (err) {
		throw err;
	}
};


module.exports.saveChat = async (req, reply) => {
	try {
        const data = req.body;
		return data;
	} catch (err) {
		throw err;
	}
};

module.exports.getListChatByRoom = async (req, reply) => {
	try {
        const roomId = req.params.id;
        const result = await Chats.find({
            roomId
        }).populate({path: 'userId'}).populate({path: 'roomId'});
		return result;
	} catch (err) {
		throw err;
	}
};
