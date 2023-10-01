const mongoose =  require('mongoose');
const { Schema } = mongoose;
const chatsSchema = new mongoose.Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'Users' },
    message: String,
    roomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom' },
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
});

module.exports = mongoose.model('Chats', chatsSchema);