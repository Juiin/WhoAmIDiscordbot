class Game {
	constructor(user1, user2) {
		this.player1 = new Player(user1);
		this.player2 = new Player(user2);
	}
}

class Question {
	constructor(question){
		this.question = question;
		this.true = false;
	}
}

class Player {
	constructor(user){
		this.id = user.id;
		this.username = user.username;
		this.globalName = user.globalName;

		this.noAmount = [0];
		this.questions = [[]];
		this.activeQuestion = undefined;
		this.round = 0;
		this.characters = [];
		this.roundsWon = 0;
	}
}

class DatabaseUser {
	constructor(id, username, globalName){
		this.id = id;
		this.username = username;
		this.globalName = globalName;

		this.defaultUser = "";
	}
}

module.exports = { Game, Question, Player, DatabaseUser };