// server/models/user.js

const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: String,
  },
  {
    timestamps: true, 
  }
);

module.exports = model('User', userSchema);
