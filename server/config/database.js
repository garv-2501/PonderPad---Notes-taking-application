const mongoose = require("mongoose");

// Disabling 'strictQuery' for Mongoose. This affects the way Mongoose handles
// certain query operations, providing more flexibility but less strictness.
mongoose.set("strictQuery", false);

// Defining an asynchronous function to connect to MongoDB

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;
