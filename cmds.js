const model = require( './model');
const { log, biglog, errorlog, colorear} = require ("./out");
const readline = require('readline');




/**
 * Muestra la ayuda
 */


exports.helpCmd = rl => {
	log( "Comandos:");
	log( "	h|help - Muestra esta ayuda.");
	log( "	list - Listar los quizes existentes.");
	log( "	show <id> - Muestra la pregunta y la respuesta del quiz indicado");
	log( "	add - Añadir un nuevo quiz interactivamente.");
	log( "	delete <id> - Borra el quiz indicado.");
	log( "	edit <id> - Editar el quiz indicado.");
	log( "	test <id> - Probar el quiz indicado.");
	log( "	p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
	log( "	credits - Créditos.");
	log( "	q|quit - Salir del programa.");
	rl.prompt();
};

exports.showCmd = (rl, id) => {
	if ( typeof id === "undefined") {
		errorlog("Falta parámetro id.");
	} else {
		try{
			const quiz = model.getByIndex(id);
			log(`	[${colorear(id, 'magenta')}]: ${quiz.question} ${colorear('=>', 'magenta')} ${quiz.answer}`);
		} catch (error) {
			errorlog(error.message);
		}
	}


	rl.prompt();
};

exports.listCmd = rl => {
	model.getAll().forEach((quiz, id) => {
		log(`	[${colorear(id, 'magenta')}]: ${quiz.question}`);

}

);
	rl.prompt();
};

exports.addCmd = rl => {
	rl.question(colorear(' Introduzca una pregunta: ', 'red'), question => {
		rl.question(colorear(' Introduzca la respuesta ', 'red'), answer =>{
			model.add(question, answer);
			log(`${colorear('Se ha añadido', 'magenta')}: ${question} ${colorear('=>','magenta')} ${answer}`);
			rl.prompt();
		});
	});
};

exports.deleteCmd = (rl, id) => {
	if ( typeof id === "undefined") {
		errorlog("Falta parámetro id.");
	} else {
		try{
			model.deleteByIndex(id);

		} catch (error) {
			errorlog(error.message);
		}
	}


	rl.prompt();
};

exports.editCmd = (rl, id) => {
	if ( typeof id === "undefined") {
		console.log(`Falta parámetro id.`);
		rl.prompt();
	} else {
		try{
			const quiz = model.getByIndex(id);
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
			rl.question(colorear(' Introduzca una pregunta: ', 'red'), question => {
				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
				rl.question(colorear(' Introduzca la respuesta ', 'red'), answer =>{
					model.update(id, question, answer);
					log(` Se ha cambiado el quiz ${colorear(id,'magenta')} por: ${question} ${colorear('=>','magenta')} ${answer}`);
					rl.prompt();
				});
			});

		} catch (error) {
			console.log(error.message);
			rl.prompt();
		}
	}

};

exports.playCmd = rl => {
	let score = 0;
	let toBeResolved=[];
	for (let i=0; i<model.count();i++){
		toBeResolved[i]=i
	}
	toBeResolved = toBeResolved.sort(function() {return Math.random() - 0.5});

	const playOne= () =>{
		if(typeof toBeResolved[0]==="undefined"){
			log(`No hay nada más que preguntar.`);
			log(`Fin del juego. Aciertos: ${score}`);
			biglog(`${score}` , 'pink');
			rl.prompt();
		} else {
			const id = toBeResolved.pop();
			let quiz = model.getByIndex(id);
			log();
			rl.question(colorear(` ${quiz.question}? `, 'red'), ans => {

					if( (ans.toLowerCase().trim()) === (quiz.answer.toLowerCase().trim())) {
					score++;
					log(` CORRECTO - Lleva ${score} aciertos`);
					playOne();
				} else {
					log(` INCORRECTO`);
					log(` Fin del juego. Aciertos: ${score}`);

					rl.prompt();
				}
			});
		}
	}

	playOne();	

};






exports.testCmd = (rl, id) => {
if ( typeof id === "undefined") {
		console.log(`Falta parámetro id.`);
		rl.prompt();
	} else {
		try{
			const quiz = model.getByIndex(id);

			rl.question(colorear(`  ${quiz.question}? `, 'red'), ans => {

					if( (ans.toLowerCase().trim()) === (quiz.answer.toLowerCase().trim())) {
					console.log(`Su respuesta es correcta.`)
					biglog(' Correcta ', 'green')
					rl.prompt();
				} else {
					console.log(`Su respuesta es incorrecta.`)
					biglog(' Incorrecta', 'red'),
					rl.prompt();
				}
			});

		} catch (error) {
			console.log(error.message);
			rl.prompt();
		}
	}
};










exports.creditsCmd = rl => {
	log('Autor de la práctica:');
	log('Juan Adolfo Bausa Pérez', 'green');
	rl.prompt();
};

exports.quitCmd = rl => {
	rl.close();
	rl.prompt();
};



