const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Book = require('../models/book');
// const auth = require('../middleware/auth');

// Endpoint pour créer un commentaire sur un livre
router.post('/books/:bookId/comments', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).send({ message: 'Book not found' });
    }
    const comment = new Comment({
      text: req.body.text,
      user: req.user._id,
      book: book._id
    });
    await comment.save();
    res.status(201).send(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Endpoint pour récupérer les commentaires d'un livre
router.get('/books/:bookId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ book: req.params.bookId })
      .populate('user', 'username')
      .sort('-createdAt')
      .exec();
    res.status(200).send(comments);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Endpoint pour supprimer un commentaire
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id: req.params.commentId, user: req.user._id });
    if (!comment) {
      return res.status(404).send({ message: 'Comment not found' });
    }
    res.status(200).send({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = router;
