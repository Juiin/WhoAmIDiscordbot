const { Game, Question} = require('./classes.js');
const { gameSchema } = require("./gameSchema.js");
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

module.exports = { findGameByPlayerIds, findGamesByPlayerId };