// import ressources necessaires//
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require ('path');
require('dotenv').config();

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

//connection a BDD mongo DB//
//process.env.db_conn

const app = express();

//headers//
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/posts', saucesRoutes);
app.use('/api/users', userRoutes);

module.exports = app;