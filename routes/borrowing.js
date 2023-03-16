const express = require ('express');
//geting the router from express
const router = express.Router();
const Borrowing = require ('../models/borrowing');
const Book = require ("../models/book");
const User = require ("../models/user");
const { addDays } = require('date-fns');
// const moment = require ("moment");

// Get all borrowings
router.get('/', async (req, res) => {
  try {
    const borrowings = await Borrowing.find();
    res.json(borrowings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one borrowing
router.get('/:id', getBorrowing, (req, res) => {
  res.json(res.borrowing);
});

// Create a new borrowing
router.post('/', async (req, res) => {
  console.log("new borrowing");
  const userId = req.body.userId;
  const bookId = req.body.bookId;

  try {
    // Check if the user has already borrowed 3 books this month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const borrowingsCount = await Borrowing.countDocuments({
      user: userId,
      startDate: { $gte: startOfMonth, $lte: endOfMonth },
      returnDate: { $exists: false },
    });

    if (borrowingsCount >= 3) {
      return res.status(400).send('Vous avez atteint la limite d\'emprunts pour ce mois');
    }

    // Check if the user has already borrowed this book
    const existingBorrowing = await Borrowing.findOne({
      user: userId,
      book: bookId,
      returnDate: { $exists: false },
    });

    if (existingBorrowing) {
      return res.status(400).send('Vous avez déjà emprunté ce livre');
    }

    // Check if the book is available
    const book = await Book.findById(bookId);

    if (!book || book.aviabilityCount <= 0) {
      return res.status(400).send('Le livre n\'est pas disponible pour le moment');
    }

    // Calculate due date and create new borrowing
    const dueDate = addDays(new Date(), 25);
    const borrowing = new Borrowing({
      user: userId,
      book: bookId,
      dueDate,
    });
    await borrowing.save();

    // Update book's available copies count
    // book.copiesCount--;
    book.aviabilityCount--;
    await book.save();

    return res.status(200).json(borrowing);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});


// Renew a borrowing
router.post('/renew', async (req, res) => {
  const borrowingId = req.body.borrowingId;

  try {
    // Check if the borrowing exists and is not returned
    const borrowing = await Borrowing.findOne({
      _id: borrowingId,
      returnDate: { $exists: false },
    });

    if (!borrowing) {
      return res.status(400).send('L\'emprunt est introuvable ou a déjà été retourné');
    }

    // Check if the borrowing is not already renewed
    if (borrowing.renewed) {
      return res.status(400).send('Vous avez déjà renouvelé cet emprunt');
    }

    // Check if the borrowing is not overdue
    const currentDate = new Date();
    if (currentDate > borrowing.dueDate) {
      return res.status(400).send('L\'emprunt est en retard et ne peut pas être renouvelé');
    }

    // Renew the borrowing
    const newDueDate = addDays(borrowing.dueDate, 25);
    borrowing.dueDate = newDueDate;
    borrowing.renewed = true;
    await borrowing.save();

    return res.status(200).json(borrowing);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

 
// Retourner un livre emprunté
router.post('/return', async (req, res) => {
    try {
      // Vérifier si l'utilisateur a emprunté le livre
      const borrowing = await Borrowing.findOneAndDelete({ 
        book: req.body.book,
        user: req.body.user,
        date_returned: null 
      });

      if (!borrowing) {
        return res.status(400).json({ message: 'Vous n\'avez pas emprunté ce livre.' });
      }
  
      // Mettre à jour le nombre de copies disponibles
      const book = await Book.findById(req.body.book);
      if (!book) {
        return res.status(404).json({ message: 'Le livre est introuvable.' });
      }
  
      book.aviabilityCount += 1;
      await book.save();
  
      res.status(200).json({ message: 'Le livre a été retourné avec succès.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Une erreur s\'est produite lors du retour du livre.' });
    }
  });


//updating one
router.patch('/:id', getBorrowing, async (req, res) => {
    if (req.body.book != null) { 
        res.borrowing.book = req.body.book
    }
    if (req.body.user != null) { 
        res.borrowing.user = req.body.user
    }
    if (req.body.publishedDate != null) { 
        res.borrowing.date_borrowed = req.body.date_borrowed
    }
    if (req.body.date_returned != null) { 
        res.borrowing.date_returned = req.body.date_returned
    }

    try {
        const updatedBorrowing = await res.borrowing.save()
        res.json(updatedBorrowing )
    } catch (err) {
        res.status(400).json({message:err.message})
    }
})


//Deleting one 
router.delete('/:id', getBorrowing, async (req, res) => {
    try {
        await res.borrowing.remove()
        res.json({message: 'Deleted Borrowing'})

    }catch (err) {
        res.status(500).json({message:err.message})
    }
   
})
// midle whare fonction

async function getBorrowing (req, res, next) {
    let borrowing
    try{
        borrowing = await Borrowing.findById(req.params.id) 
        if (borrowing == null) {
            return res.status(404).json({message: 'Cannot find borrowing'})

        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    res.borrowing = borrowing
    next()

}

// displayActivityHistor need to change the borrowing model

async function displayActivityHistory(userId) {
  try {
    const user = await User.findById(userId);
    console.log(`Activity history for user ${user.name}:`);
    console.log(user.activity);
  } catch (error) {
    console.error(error);
  }
}

router.get('/:userId/activity', async (req, res) => {
  try {
    const userId = req.params.userId;
    await displayActivityHistory(userId);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// --------------------------BorrowingHistory------------------


const { getUserBorrowingHistory } = require('./borrowing');

router.get('/users/:userId/borrowing-history', async (req, res) => {
  const userId = req.params.userId;
  try {
    const borrowingHistory = await getUserBorrowingHistory(userId);
    res.status(200).json(borrowingHistory);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving borrowing history', error: error.message });
  }
});






module.exports= router

//Creating one borrowing  (old method)
// router.post('/', async (req, res) => {
//     try {
//         const book = await Book.findById(req.body.book);
//         if (!book) {
//             return res.status(404).json({ message: 'Le livre n\'a pas été trouvé' });
//         }
//         if (book.aviabilityCount < 1) {
//             return res.status(400).json({ message: 'Il n\'y a plus de copies disponibles pour ce livre' });
//         }

//         const user = await User.findById(req.body.user);
//         if (!user) {
//             return res.status(404).json({ message: 'L\'utilisateur n\'a pas été trouvé' });
//         }
//         const borrowings = await Borrowing.find({ user: user._id, date_borrowed: { $gte: moment().subtract(1, 'month') } });

//         if (borrowings.length >= 3) {
//             return res.status(400).json({ message: 'L\'utilisateur a déjà emprunté 3 livres ce mois-ci' });
//         }

//         const newBorrowing = new Borrowing({
//             book: book._id,
//             user: user._id
//         });
//         await newBorrowing.save();

//         book.aviabilityCount--;
//         await book.save();

//         res.status(201).json(newBorrowing);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });