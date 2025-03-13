//import mongoose from "mongoose";
const {Schema, model} = require("mongoose");

const schema = new Schema({
    id : String,
    username : String,
    globalName : String,
    defaultUser : String,
});

const userSchema = model("User", schema);
module.exports = { userSchema };