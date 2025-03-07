//import mongoose from "mongoose";
const {Schema, model} = require("mongoose");

const schema = new Schema({
    player1 : {
        id : String,
        username : String,
        globalName : String,

        noAmount : [Number],
        questions : [[{
            question : String,
            true : Boolean,
        }]],
        activeQuestion : {
            question : String,
            true : Boolean,
        },
        round : Number,
        guessedCharacters : [String],
        roundsWon : Number,
    },
    player2 : {
        id : String,
        username : String,
        globalName : String,

        noAmount : [Number],
        questions : [[{
            question : String,
            true : Boolean,
        }]],
        activeQuestion : {
            question : String,
            true : Boolean,
        },
        round : Number,
        guessedCharacters : [String],
        roundsWon : Number,
    },
    closed : {
        type : Boolean,
        default : false,
    },
});

const gameSchema = model("Game", schema);
module.exports = { gameSchema };