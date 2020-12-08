// import ressources necessaires//
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const saucesCtrl = require('../controllers/sauces');


// GET / -> Récupérer tous les posts
// POST / -> Créer un post
// DELETE /:id -> Supprimer un post
// PUT /:id/like -> Liker ou supprimer le like

//creation des routes sauces//
router.get('/', auth, saucesCtrl.getAllSauces); //Récupérer tous les posts
router.post('/', auth, multer, saucesCtrl.createSauce);
router.get('/:id', auth, saucesCtrl.getOneSauce);
router.put('/:id', auth, multer, saucesCtrl.modifySauce);
router.delete('/:id', auth, saucesCtrl.deleteSauce);
router.post('/:id/like', auth, saucesCtrl.likeSauce);

module.exports = router;