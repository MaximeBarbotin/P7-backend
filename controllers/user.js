// import ressources necessaires//
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mysql = require('mysql2');
 
// create the connection to database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


const User = require('../models/User');

exports.getUsers = (req, res) => {
    connection.query(
        'SELECT * FROM `user`',
        function(err, results, fields) {
            res.json(results)
        }
      );
}

//inscription//
exports.signup = (req, res, next) => {
    connection.execute('SELECT * FROM user WHERE email = ?', 
    [req.body.email],
    function(err, results){
        if(err){
            res.status(500).json({status: 'KO', description: err})
            return
        }
        if(results[0]){
            res.status(401).json({status: 'KO', description: "L'utilisateur existe déjà"})
            return;
        } 
        bcrypt.hash(req.body.password, 10)
        .then(hash => {
            connection.execute(
                'INSERT INTO user(first_name, last_name, email, password) VALUES(?, ?, ?, ?)',
                [req.body.first_name, req.body.last_name, req.body.email, hash],
                function(err, results, fields) {
                    if(err){
                        res.status(500).json({status: 'KO', description: err})
                    }
                    res.status(201).end();
                })
            })
        .catch(error => res.status(500).json({ error }))
    }
    )
};

//connection//
exports.login = (req, res, next) => {
    connection.execute(
        'SELECT * FROM user WHERE email = ?',
        [req.body.email],
        function(err, results, fields) {
            const user = results[0];
            if(err){
                return res.status(500).json({ error: 'Erreur requete de recherche user' });   
            }
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user.id,
                        token: jwt.sign(
                            { userId: user.id, admin: user.admin },
                            process.env.jwt_token,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
    })
    
};

exports.getMe = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.jwt_token);
    const userId = decodedToken.userId;

    connection.execute(
        'SELECT * FROM user WHERE id = ?',
        [userId],
        function(err, results, fields) {
            const user = results[0];
            if(err){
                return res.status(500).json({ error: 'Erreur requete de recherche user' });   
            }
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            res.status(200).json(user)
           
    })
    
};

exports.update = (req, res, next) => {

    connection.execute(
        'UPDATE user SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
        [req.body.first_name, req.body.last_name, req.body.email, req.params.id],
        function(err, results, fields) {
            
            if(err){
                return res.status(500).json({ error: 'Erreur requete de recherche user' });   
            }
            
            res.status(200).end();
           
    })
    
};