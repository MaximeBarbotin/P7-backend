// import ressources necessaires//
const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

// GET / -> Récupérer tous les users
// POST /signup -> Ajouter un utilisateur
// POST /login -> Connecter un utilisateur

//creation des routes users//
router.get('/', userCtrl.getUsers);
router.post('/register', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;