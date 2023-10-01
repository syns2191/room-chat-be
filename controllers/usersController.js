const Users = require('../models/users');

module.exports.getUsers = async (req, reply) => {
	try {
		const users = await Users.find();
		return users;
	} catch (err) {
		throw err;
	}
};


module.exports.addUser = async (req, reply) => {
	try {
		const user = await Users.findOneAndUpdate();
		return user;
	} catch (err) {
		throw err;
	}
};
