// import ressources necessaires//
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const PostCtrl = require('../controllers/post');


// GET / -> Récupérer tous les posts
router.get('/', auth, PostCtrl.getAllPost);

// POST / -> Créer un post
router.post('/', auth, multer, PostCtrl.createPost);

//PUT  /:id -> Modifier un post
router.put('/:id', auth, multer, PostCtrl.modifyPost);

// DELETE /:id -> Supprimer un post
router.delete('/:id', auth, PostCtrl.deletePost);

// PUT /:id/like -> Liker ou supprimer le like
//router.post('/:id/like', auth, PostCtrl.likePost);

module.exports = router;