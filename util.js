const { User } = require('discord.js');
const { Game, Question, DatabaseUser} = require('./classes.js');
const { gameSchema } = require("./gameSchema.js");
const { userSchema } = require("./userSchema.js");
const mongoose = require(`mongoose`);

async function findGameByPlayerIds(player1Id, player2Id) {
    try {
      const games = await gameSchema.find({
        $or: [
          { 'player1.id': player1Id, 'player2.id': player2Id }, 
          { 'player1.id': player2Id, 'player2.id': player1Id }   
        ],
        closed: { $ne: true },
      });
  
      return games[0];  
    } catch (err) {
      console.error('Error finding games:', err);
    }
  }


async function findGamesByPlayerId(playerId) {
try {
    const games = await gameSchema.find({
    $or: [
        { 'player1.id': playerId }, 
        { 'player2.id': playerId },  
    ],
    closed: { $ne: true },
    });

    return games;  
} catch (err) {
    console.error('Error finding games:', err);
}
}

async function getOpponents(playerId) {
  try {
    const games = await gameSchema.find({
      $or: [
        { "player1.id": playerId },
        { "player2.id": playerId },
      ],
      closed: false,
    });

    
    const opponentIds = games.map(game => {
      if (game.player1.id === playerId) {
        return game.player2; 
      } else {
        return game.player1; 
      }
    });

    //there shouldnt be duplicates so not needed?
    //const uniqueOpponentIds = [...new Set(opponentIds)];

    return opponentIds;
  } catch (error) {
    console.error('Error fetching player games:', error);
    return [];
  }
}

async function findUser(userId) {
  try {
    const user = await userSchema.findOne({ id: userId });
  
    return user;  
  } catch (err) {
      console.error('Error finding user:', err);
  }
  }

async function createNewUser(player){
  try {
    const user = await findUser(player.id);
    console.log(user);

    if (user){
      return user;
    } 
    else {
      const schema = new userSchema(new DatabaseUser(player.id, player.username, player.globalName));
			await schema.save();
      return schema;
    }
  } catch (err) {
      console.error('Error finding user:', err);
  }
}

function findGameWithUser(games, userid){
    const returnGame = games.find(game =>
      game.player1.id === userid || game.player2.id === userid);

    if (returnGame){
      return returnGame;
    } 
    else {
      return games[0];
    }
  }

module.exports = { findGameByPlayerIds, findGamesByPlayerId, getOpponents, findUser, createNewUser, findGameWithUser };