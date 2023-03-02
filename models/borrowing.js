const mongoose = require('mongoose');

// Définition du modèle de la collection Borrowing
const BorrowingSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book', // référence la collection 'books'
    required: true,
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // référence la collection 'users'
    required: true,
  },
  date_borrowed: {
    type: Date,
    default: Date.now,
  },
  date_returned: {
    type: Date,
    default: null,
  },
});

const Borrowing = mongoose.model('Borrowing', BorrowingSchema);

module.exports = Borrowing;