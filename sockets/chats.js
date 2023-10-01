const mq = require("mqemitter");
const emitter = mq({ concurrency: 5 });
const Chats = require('../models/chats');
const eventType = async (message, connection) => {
    const { meta, room, participant, payload } = JSON.parse(message);
    console.log("received message", { meta, room, participant, payload });

    switch (meta) {
    	case "join":
        // Activate a new message listener
        const messageListener = (event, done) => {
            if (
                event.room == room &&
                (event.broadCast || event.participant == participant)
            ) {
                connection.socket.send(
                JSON.stringify({ meta: event.meta, payload: event.payload })
                );
            }

            done();
        };

        emitter.on("room-event", messageListener);

        connection.socket.send(
					JSON.stringify({
							meta: "room-joined",
							room,
							participant,
					})
        );
        return messageListener;

    	case "send-message":
        // Use the emitter to broadcast the message to the room participants
        emitter.emit({
					topic: "room-event",
					meta: "send-message",
					room,
					broadCast: true,
					payload,
        });
        await Chats.create({
          userId: payload.userid,
          message: payload.message,
          roomId: payload.roomid
        })
        break;

    	default:
        break;
    }
}


module.exports = async (instance, _opts, _done) => {
    instance.get(
      "/chats",
      { websocket: true },
      (connection /* SocketStream */, req /* FastifyRequest */) => {
        let messageListener;
  
        connection.socket.on("message", (message) => {
            const msgLs = eventType(message, connection);
						if (msgLs) {
							messageListener = msgLs;
						}
        });
        connection.socket.on("close", () => {
          console.log("removing message listener", { messageListener });
  
          if (messageListener) {
            emitter.removeListener("room-event", messageListener);
          }
        });
      }
    );

    instance.post("/send-message", (request, reply) => {
      reply.type("application/json").code(200);
  
      emitter.emit({
        topic: "room-event",
        meta: "send-message",
        room: request.body.room,
        broadCast: true,
        payload: {
          participant: request.body.participant,
          text: request.body.text,
          timestamp: new Date(),
        },
      });
  
      return { success: true };
    });
  }