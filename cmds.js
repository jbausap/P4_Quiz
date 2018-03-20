const {models} = require( './model');
const { log, biglog, errorlog, colorear} = require ("./out");
const readline = require('readline');
const Sequelize = require('sequelize');





/**
 * Muestra la ayuda
 */


exports.helpCmd = (socket, rl) => {
	log( socket, "Comandos:");
	log( socket, "	h|help - Muestra esta ayuda.");
	log( socket,  "	list - Listar los quizes existentes.");
	log( socket,  "	show <id> - Muestra la pregunta y la respuesta del quiz indicado");
	log( socket,  "	add - Añadir un nuevo quiz interactivamente.");
	log( socket,  "	delete <id> - Borra el quiz indicado.");
	log( socket,  "	edit <id> - Editar el quiz indicado.");
	log( socket,  "	test <id> - Probar el quiz indicado.");
	log( socket,  "	p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
	log( socket,  "	credits - Créditos.");
	log( socket,  "	q|quit - Salir del programa.");
	rl.prompt();
};


const validateId =  id => {
	return new Sequelize.Promise ((resolve, reject) => {
		if ( typeof id === 'undefined') {
			reject(new Error (`Falta el parametro <id>.`));
		} else {
			id = parseInt(id);
			if (Number.isNaN(id)) {
				reject( new Error(`El valor del parámetro <id> no es un número.`));
			} else {
				resolve (id);
			}
		}
	});
};



exports.showCmd = ( socket, rl, id) => {
	validateId(id)
	.then (id => models.quiz.findById(id))
	.then (quiz => {
		if(!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}
		log( socket, `[${colorear(quiz.id, 'magenta')}]:	${quiz.question} ${colorear( '=>', 'magenta')} ${quiz.answer}`); 
	})
	.catch(error => {
		log( socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};
	

exports.listCmd =  (socket, rl) => {
	models.quiz.findAll()
	.each(quiz => {
		log( socket, `[${colorear(quiz.id, 'magenta')}]: ${quiz.question}`);
	})
	.catch( error => {
		log( socket, error.message);
	})
	.then(() => {
	rl.prompt();
	});

};

const makeQuestion = ( socket, rl, text) => {
	return new Sequelize.Promise((resolve, reject) => {
		rl.question(colorear(text, 'red'), answer => {
			resolve(answer.trim());
		});
	});
};


exports.addCmd = (socket, rl) => {
	makeQuestion( socket, rl, ' Introduzca una pregunta: ')
	.then (q => {
		return makeQuestion( socket, rl, ' Introduzca la respuesta:')
		.then( a => {
			return {question: q, answer: a};
		});
	})
	.then(quiz => {
		return models.quiz.create(quiz);
	})
	.then((quiz) => {
		log( socket, ` ${colorear ( 'Se ha añadido', 'magenta')}: ${quiz.question} ${colorear('=>','magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		log( socket,  'El quiz es erroneo:'); 
		error.errors.forEach(({message}) => log( socket, message));
	})
	.catch(error => {
		log( socket, error.message);
	})
	.then (() => {
		rl.prompt();
	});
};

exports.deleteCmd = ( socket, rl, id) => {
	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		log( socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.editCmd = ( socket, rl, id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}

		process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
		return makeQuestion( socket, rl, 'Introduzca la pregunta: ')
		.then( q => {
			process.stdoout.isTTY && setTimeout(() => { rl.write(quiz.answer)}, 0);
			return makeQuestion( socket, rl, 'Introduzca la respuesta')
			.then( a => {
				quiz.question = q;
				quiz.answer = a;
				return quiz;
			});
		});
	})
	.then(quiz => {
		return quiz.save();
	})
	.then (quiz => {
		log( socket, ` Se ha cambiado el quiz ${colorear(id,'magenta')} por: ${quiz.question} ${colorear('=>','magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		log( socket, 'El quiz es erroneo');
		error.errors.forEach(({message}) => log( socket, message));
	})
	.catch(error=> {
		log( socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};



exports.playCmd =  (socket, rl) => {
	log( socket, 'Jugar', 'red');
	let score = 0;
	let toBePlayed=[];
	


	const playOne = () => {

		return new Promise((resolve, reject) => {

	
			if (toBePlayed.length <= 0) {
				log( socket, `FIN . Aciertos: ${score}`);
				resolve();	
				return;
			}

			let pos = Math.floor( Math.random()*toBePlayed.length)
			let quiz = toBePlayed[pos];
			toBePlayed.splice(pos,1)
	
			makeQuestion( socket, rl, `${quiz.question}?` )
			.then(answer => {
				if (answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
					score++;
					log( socket, `Su respuesta es correcta.`)
					resolve(playOne());
				} else {
					log( socket, `Su respuesta es incorrecta.`);
					log( socket, `FIN . Aciertos: ${score}`);
					resolve();
				}
			})
		});
	
	}
	models.quiz.findAll({raw: true})
	.then(quizzes => {
		toBePlayed = quizzes;
	})
	.then(() => {	
		return playOne();	
	})
	.catch( e => {
		log( socket,  "Error:" + e);
	})
	.then(() => {
		rl.prompt();
	})
};



	

exports.testCmd = ( socket, rl, id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}
		return makeQuestion( socket, rl, `${quiz.question}`)
		.then( ans => {
			if( (ans.toLowerCase().trim()) === (quiz.answer.toLowerCase().trim())) {
				log( socket, `Su respuesta es correcta.`)
				biglog( socket, ' Correcta ', 'green')
			} else {
				log( socket, `Su respuesta es incorrecta.`);
				biglog( socket, ' Incorrecta', 'red');
			}
		});
	})
	.catch(Sequelize.ValidationError, error => {
		log( socket, 'El quiz es erroneo');
		error.errors.forEach(({message}) => log( socket, message));
	})
	.catch(error=> {
		log( socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});	
};








exports.creditsCmd =(socket,rl) => {
	log( socket, 'Autor de la práctica:');
	log( socket, 'Juan Adolfo Bausa Pérez', 'green');
	rl.prompt();
};

exports.quitCmd =  (socket, rl) => {
	rl.close();
	socket.end();
};



