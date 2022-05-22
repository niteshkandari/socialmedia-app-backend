const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute  = require("./routes/post");

const { MONGODB_URL } = process.env;

// mongoose.connect(MONGODB_URL, { useMongoClient: true }, () => {
//   console.log("connected to Mongodb");
// });  // will throw err if we make post req and try to use schema
//Mongoose lets you start using your models immediately, without waiting for mongoose to establish a connection to MongoDB.
// That’s because mongoose buffers model function calls internally. This buffering is convenient, but also a common source of confusion. Mongoose will not throw any errors by default if you use a model without connecting.

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.error(err);
  });

//middleware
app.use(express.json()); //It parses incoming JSON requests and puts the parsed data in req.body
app.use(helmet());
app.use(morgan("common"));

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.listen(8080, () => {
  console.log("server is runing");
});
