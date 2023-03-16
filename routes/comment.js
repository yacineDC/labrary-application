const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const User = require('../models/user');
const Book = require ("../models/book");

// Créer un nouveau commentaire
router.post('/', async (req, res) => {

  try {
    const comment = new Comment(req.body);
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir tous les commentaires pour un livre
router.get('/book/:bookId', async (req, res) => {
  try {
    const comments = await Comment.find({ book: req.params.bookId })
      .populate('user')
      .populate('parentComment')
      .populate({
        path: 'parentComment',
        populate: { path: 'user' }
      });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir tous les commentaires pour un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.params.userId })
      .populate('book')
      .populate('parentComment')
      .populate({
        path: 'parentComment',
        populate: { path: 'user' }
      });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir un commentaire spécifique par ID du commentaire
router.get('/:id', getComment, (req, res) => {
  res.json(res.comment);
});

// Supprimer un commentaire
router.delete('/:id', getComment, async (req, res) => {
  try {
    await res.comment.remove();
    res.json({ message: 'Commentaire supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Répondre à un commentaire
router.post('/:id/reply', getComment, async (req, res) => {
  try {
    const reply = new Comment(req.body);
    reply.book = res.comment.book;
    reply.parentComment = res.comment._id;
    reply.user = req.user._id;
    await reply.save();
    res.status(201).json(reply);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Middleware pour obtenir un commentaire par ID
async function getComment(req, res, next) {
  let comment;
  try {
    comment = await Comment.findById(req.params.id);
    if (comment == null) {
      return res.status(404).json({ message: 'Commentaire introuvable' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.comment = comment;
  next();
}


router.get('/example', (req, res) => {
  console.log(req); // log the entire request object
  console.log(req.user); // log the user object
  res.send('Example route');
});





module.exports = router;
