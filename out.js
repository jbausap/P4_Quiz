const figlet = require('figlet');
const chalk = require('chalk');


const colorear = (msg, color) => {
	if (typeof color !== "undefined") {
		msg = chalk[color].bold(msg);
	}
	return msg;
};

const log = ( msg, color) => {
	console.log( colorear(msg,color));
};

const biglog = (msg, color) => {
	log(figlet.textSync(msg,{ horizontalLayout: 'full' }),color);
};

const errorlog = (emsg) => {
	console.log(`${colorear("Error", "red")}: ${colorear(colorear(emsg,"red"), "bgYellowBrigth")}`);
};

exports = module.exports = {
	colorear,
	log,
	biglog,
	errorlog
};

