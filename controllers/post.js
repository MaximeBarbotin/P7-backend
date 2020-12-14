// import ressources necessaires//
const post = require('../models/Post');
const fs = require('fs');
const mysql = require('mysql2');
require('dotenv').config();
const jwt = require('jsonwebtoken');
 
// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'groupomania'
});

//creation du .POST (creation de post)//
exports.createPost = (req, res, next) => {

  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.jwt_token);
  const userId = decodedToken.userId;

  const postObject = req.body;
  connection.query(
    'INSERT INTO post(title, description, image, date, user_id) VALUES(?, ?, ?, NOW(), ?)',
    [postObject.title, postObject.description, req.file.filename, userId],
    function(err, results, fields) {
        if(err){
          res.status(500).json(err)
        }
        res.status(201).json({status: 'OK'})
    }
  );
}

  //creation du .PUT (modification d'une post)
  exports.modifyPost = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.jwt_token);
    const userId = decodedToken.userId;

    const postObject = req.body;

    connection.query('SELECT * FROM post WHERE id = ?', [req.params.id], function(err, results){
      if(err){
        res.status(500).json(err)
      }
      if(req.file){
        if(results[0].image !== ''){
          fs.unlinkSync(`images/${results[0].image}`)
        }
      }
    })

    connection.query(
      'UPDATE post SET title=?, description = ?, image = ?, date = NOW(), user_id = ? WHERE id = ?',
      [postObject.title, postObject.description, req.file.filename, userId, req.params.id],
      function(err, results, fields) {
          if(err){
            res.status(500).json(err)
          }
          res.status(200).json({status: 'OK'})
      }
    );



  };

  //creation du .DELETE (suppression donne)
  exports.deletePost = (req, res, next) => {

    connection.query(
      'SELECT * FROM `post` WHERE id = ?',
      [req.params.id],
      function(err, results){
          if(err){
            res.status(500).json(err)
          }
          if(results[0].image !== ''){
            fs.unlinkSync(`images/${results[0].image}`)
          }

          connection.query(
            'DELETE FROM post WHERE id = ?',
            [req.params.id],
            function(err, results){
              if(err){
                res.status(500).json(err)
              }
              res.status(204).end();
            }
          )


      })
  };

  //creation du .GET (recuperation donnees tout les produits) 
  exports.getAllPost = (req, res, next) => {
    connection.query(
      'SELECT * FROM `post`',
      function(err, results, fields) {
          if(err){
            res.status(500).json(err)
          }
          res.json(results)
      }
    );
  };