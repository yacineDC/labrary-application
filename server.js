// LOAD OUR EN ENVRONMENT variable FROM ENV
require('dotenv').config()

const express = require('express');
const app = express();
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

// we created a vairiable for database
mongoose.connect(process.env.DATABASE_URL);

// CONFIGURATION OF CONNECTION
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

// seting up our server to accept jeason
app.use(express.json());
// app.use(express.urlencoded({extended}));

// seting up our routers to our routes files (user)

const userRouter= require ('./routes/user');
app.use('/user', userRouter);

// seting up our routers to our routes files (category)
const categoryRouter= require ('./routes/category');
app.use('/category', categoryRouter);

// seting up our routers to our routes files (book)
const bookRouter= require ('./routes/book');
app.use('/book', bookRouter);

// seting up our routers to our routes files (borrowing)
const borrowingRouter= require ('./routes/borrowing');
app.use('/borrowing', borrowingRouter);


// seting up our routers to our routes files (comment)
const commentRouter= require ('./routes/comment');
app.use('/comment', commentRouter);


app.listen(3000, () => console.log('Server Started'));