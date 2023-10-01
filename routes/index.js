const userController = require('../controllers/usersController');
const chatController = require('../controllers/chatsController')
// import { AddCarSchema, GetCarSchema, GetCarsSchema, PutCarSchema, DeleteCarSchema } from './documentation/carsApi';

const getUserRoute = {
	method: 'GET',
	url: '/api/users',
	handler: userController.getUsers
};

const addUser = {
	method: 'POST',
	url: '/api/users',
	handler: userController.addUser
}

const initChatRoomAndUser = {
	method: 'POST',
	url: '/api/initChat',
	handler: chatController.initUserAndChatRoom
}

const historyChat = {
	method: 'GET',
	url: '/api/history-chats/:id',
	handler: chatController.getListChatByRoom
}

const routes = [getUserRoute, addUser, initChatRoomAndUser, historyChat];

module.exports = routes;