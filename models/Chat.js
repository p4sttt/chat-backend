const { Schema, model } = require("mongoose")

const Message = new Schema({
  date: {type: Date, default: Date.now},
  message: {type: String},
  fromUser: {type: String}
})

const Chat = new Schema({
  date: {type: Date, default: Date.now},
  roomId: {type: String, required: true, unique: true},
  messages: [Message]
})


module.exports = model("Chat", Chat)