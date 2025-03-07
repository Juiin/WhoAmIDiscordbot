const fs = require('node:fs');
const path = require('node:path');
const mongoose = require(`mongoose`);

// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.cooldowns = new Collection();

// Game

const dbUrl = "mongodb://localhost:27017/WhoAmIGames";

mongoose.connect(dbUrl, {})
	.then(result => console.log("Database connected"))
	.catch(err => console.log(err));

// 	const { gameSchema } = require("./gameSchema.js");
// 	const { Game } = require("./classes.js");
	
// 	const user1 = {id: 3, username: "nils", globalName: "nils23" };
// 	const user2 = {id: 2, username: "juin", globalName: "juin64" };
	
// 	test = new gameSchema(new Game(user1, user2));

// 	//dbtest(test.save());
	
// 	const game = dbtest(gameSchema.find({
// 		$or: [
// 			{ 'player1.id': 3, 'player2.id': 2 },  // player1 is 2 and player2 is 3
// 			{ 'player1.id': 2, 'player2.id': 3 }   // player1 is 3 and player2 is 2
// 		  ]
// 	  }));

	
// 	//dbtest(game.save());
	
// 	//const firstGame = gameSchema.findOne({});
// 	//console.log(firstGame);
// async function dbtest(t){
// 	try {
// 		const res = await t;
// 		//console.log(res[0].player1.activeQuestion);
// 		return res;
// 	} catch(err){
// 		console.log(err);
// 	}
	 
// }
//client.activeGames = []; not used
//client.activePlayerGames = new Collection();


// Log in to Discord with your client's token
client.login(token);