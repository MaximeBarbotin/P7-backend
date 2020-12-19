// import ressources necessaires//
const post = require('../models/Post');
const fs = require('fs');
const mysql = require('mysql2');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { postModifiable } = require('../utils/index')
 
// create the connection to database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

//creation du .POST (creation de post)//
exports.createPost = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.jwt_token);
  const userId = decodedToken.userId;
  const postObject = req.body;
  const filename = req.file ? req.file.filename : ''
  connection.query(
    'INSERT INTO post(title, description, image, date, user_id) VALUES(?, ?, ?, NOW(), ?)',
    [postObject.title, postObject.description, filename, userId],
    function(err, results, fields) {
        if(err){
          res.status(500).json(err)
        }
        connection.query(`
          SELECT post.id, title, description, image, first_name, last_name
          FROM post  
          INNER JOIN user ON user.id = post.user_id 
          WHERE post.id = LAST_INSERT_ID()`,
          function(err, results) {
          if(err){
            res.status(500).json(err)
          }
          const data = results[0]
          data['modifiable'] = true
          data['likes'] = 0;
          res.status(201).json({status: 'OK', post: data})
        })        
    }
  );
}

  //creation du .PUT (modification d'une post)
  exports.modifyPost = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.jwt_token);
    const userId = decodedToken.userId;
    const postObject = req.body;
    const filename = req.file ? req.file.filename : ''
    connection.query('SELECT * FROM post WHERE id = ?', [req.params.id], function(err, results){
      if(err){
        res.status(500).json(err)
      }
      if(req.file){
        if(results[0].image !== ''){
          fs.unlinkSync(`images/${results[0].image}`)
        }
      }
    });
    connection.query(
      'UPDATE post SET title=?, description = ?, image = ?, user_id = ? WHERE id = ?',
      [postObject.title, postObject.description, filename, userId, req.params.id],
      function(err, results, fields) {
          if(err){
            res.status(500).json(err)
          }
        
          res.status(200).json({status: 'OK', filename})
      }
    );
  }

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
      });
  }

  //creation du .GET (recuperation donnees tout les produits) 
  exports.getAllPost = (req, res, next) => {
    connection.query(
      `SELECT post.id, title, date, description, image, post.user_id, user.first_name, user.last_name, 
          (SELECT count(*) FROM likes WHERE likes.post_id = post.id) as "likes",
          (SELECT count(*) FROM likes WHERE likes.post_id = post.id AND likes.user_id = user.id) as "liked"
      FROM post
      LEFT JOIN likes ON likes.post_id = post.id
      INNER JOIN user ON user.id = post.user_id
      GROUP BY id 
      ORDER BY date DESC`,
      function(err, results, fields) {
          if(err){
            res.status(500).json(err)
          }
          const data = []
          for(let i = 0; i < results.length; i++){
            const result = results[i]
            //Ajout d'un champs modifiable pour activer les bouton côté front
            result['modifiable'] = postModifiable(req, result) 
            data.push(result) 
          }
          res.json(data)
      }
    );
  }

  exports.likePost = (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.jwt_token);
    const userId = decodedToken.userId;
    connection.query(
      'INSERT INTO likes(post_id, user_id) VALUES(?, ?)',
       [req.params.id, userId],
       function(err, results){
          if(err){
            if(err.code === "ER_DUP_ENTRY") {
              connection.query('DELETE from likes WHERE post_id = ? AND user_id = ?', 
              [req.params.id, userId],
              function(err, results){
                if(err){
                  res.status(500).json(err)
                }
                res.status(204).end()
              })
            } else {
              res.status(500).json(err)
            }
          } else {
            res.status(201).json({'status' : 'OK'})
          }        
       }
    )

  }