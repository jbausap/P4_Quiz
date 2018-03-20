const figlet = require('figlet');
const chalk = require('chalk');


const colorear = (msg, color) => {
	if (typeof color !== "undefined") {
		msg = chalk[color].bold(msg);
	}
	return msg;
};

const log = (socket, msg, color) => {
	socket.write( colorear(msg,color) + "\n");
};

const biglog = (socket, msg, color) => {
	log(socket, figlet.textSync(msg,{ horizontalLayout: 'full' }),color);
};

const errorlog = (socket, emsg) => {
	socket.write(socket, `${colorear("Error", "red")}: ${colorear(emsg,"yellow")}\n`);
};

exports = module.exports = {
	colorear,
	log,
	biglog,
	errorlog
};

