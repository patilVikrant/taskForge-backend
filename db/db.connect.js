const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGODB;

let isConnected = false;

const initializeDatabase = async () => {
  if (isConnected) {
    console.log("Using existing connection");
    return;
  }

  await mongoose
    .connect(mongoUri)
    .then(() => {
      isConnected = true;
      console.log("Connected to the Database");
    })
    .catch((error) => {
      console.log("Error connecting to the Database", error);
      process.exit(1);
    });
};

module.exports = initializeDatabase;
