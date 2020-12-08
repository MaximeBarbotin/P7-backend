// import ressources necessaires//
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mysql = require('mysql2');
 
// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'groupomania'
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
    //TODO: Vérifier que le mail de l'utilisateur n'existe pas déjà

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
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.jwt_token,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
    
    })
    
};