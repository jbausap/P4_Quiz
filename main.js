const readline = require('readline');
const cmds = require("./cmds");
const { log, biglog, errorlog, colorear} = require ("./out");
const net = require ("net");

net.createServer( socket => {
	console.log( "Se ha conectado un cliente desde" + socket.remoteAddress);
	biglog(socket, 'CORE Quiz', 'green');
		

	const rl = readline.createInterface({
	  input: socket,
	  output: socket,
	  prompt: colorear("Quiz> ", 'blue'),
	  completer: (line) => {
	  const completions = 'h help delete edit p play credits q quit test list'.split(' ');
	  const hits = completions.filter((c) => c.startsWith(line));
	  // show all completions if none found
	  return [hits.length ? hits : completions, line];
	}
	});
	

	socket
	.on("end", () => { rl.close();})
	.on("error", () => { rl.close();});
	rl.prompt();
	
	rl.on('line', (line) => {
	  let args = line.split(" ");
	  let cmd = args[0].toLowerCase().trim();
	
	  switch (cmd) {
	
	    case '':
	  	rl.prompt();
		break;
	
	    case 'h':
	    case 'help':
		cmds.helpCmd(socket, rl);
	  	break;  
	
	    case 'quit':
	    case 'q':
		cmds.quitCmd(socket, rl);
		break;
	
	    case 'add':
		cmds.addCmd(socket, rl);
		break;
	
	    case 'list':
		cmds.listCmd(socket, rl);
		break;
	
	    case 'show':
		cmds.showCmd(socket, rl, args[1]);
		break;
	
	    case 'test':
		cmds.testCmd(socket, rl, args[1]);
		break;
	
	    case 'play':
	    case 'p':
		cmds.playCmd(socket, rl);
		break;
	
	    case 'delete':
		cmds.deleteCmd(socket, rl, args[1]);
		break;
	
	    case 'edit':
		cmds.editCmd(socket, rl, args[1]);
		break;
	
	    case 'credits':
		cmds.creditsCmd(socket, rl);
		break;
	
	    default:
		log(socket, `Comando desconocido: '${colorear(cmd,"red")}'`);
		log(socket, `Use ${colorear('help','green')} para ver todos los comandos disponibles.`);
	  	rl.prompt();
	    	break;
	  }
	}).on('close', () => {
	  log(socket, 'Adiós!');
	  });
})
.listen(3030);








