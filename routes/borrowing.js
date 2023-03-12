const express = require ('express')
//geting the router from express
const router = express.Router()
const Borrowing = require ('../models/borrowing')
const Book = require ("../models/book")
const User = require ("../models/user")
const moment = require ("moment")

// Geting all 
router.get('/', async (req, res) => {
try {
    const Borrowings = await Borrowing.find()
    res.json(Borrowings)
} catch (err) {
  res.status (500).json({message: err.message})  
}
})

//Getting one 
router.get('/:id', getBorrowing, (req, res) => {
    res.json(res.borrowing)
})

//Creating one 

router.post('/', async (req, res) => {
    try {
        const book = await Book.findById(req.body.book);
        if (!book) {
            return res.status(404).json({ message: 'Le livre n\'a pas été trouvé' });
        }
        if (book.aviabilityCount < 1) {
            return res.status(400).json({ message: 'Il n\'y a plus de copies disponibles pour ce livre' });
        }

        const user = await User.findById(req.body.borrower);
        if (!user) {
            return res.status(404).json({ message: 'L\'utilisateur n\'a pas été trouvé' });
        }
        const borrowings = await Borrowing.find({ borrower: user._id, date_borrowed: { $gte: moment().subtract(1, 'month') } });

        if (borrowings.length >= 3) {
            return res.status(400).json({ message: 'L\'utilisateur a déjà emprunté 3 livres ce mois-ci' });
        }

        const newBorrowing = new Borrowing({
            book: book._id,
            borrower: user._id
        });
        await newBorrowing.save();

        book.aviabilityCount--;
        await book.save();

        res.status(201).json(newBorrowing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

 
// Retourner un livre emprunté
router.post('/return', async (req, res) => {
    try {
      // Vérifier si l'utilisateur a emprunté le livre
      const borrowing = await Borrowing.findOneAndDelete({ 
        book: req.body.book,
        borrower: req.body.borrower,
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
  


//Creating one old method

// router.post('/', async (req, res) => {
//     const newBook = new Borrowing({
//         title:req.body.title,
//         description: req.body.description,
//         publishedDate: req.body.publishedDate,
//         pageCount: req.body.pageCount,
//         author: req.body.author,
//         copiesCount: req.body.copiesCount,
//         aviabilityCount: req.body.aviabilityCount,
    
//     })
//     try{
//         await newBook.save()
//         res.status(201).json(newBook)

//     } catch (err) {
//         res.status(400).json({message:err.message})
//     }
// })

//updating one
router.patch('/:id', getBorrowing, async (req, res) => {
    if (req.body.book != null) { 
        res.borrowing.book = req.body.book
    }
    if (req.body.borrower != null) { 
        res.borrowing.borrower = req.body.borrower
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



module.exports= router