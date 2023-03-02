const express = require ('express')
//geting the router from express
const router = express.Router()
const Borrowing = require('../models/borrowing')


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

        const user = await User.findById(req.body.user);
        if (!user) {
            return res.status(404).json({ message: 'L\'utilisateur n\'a pas été trouvé' });
        }
        const borrowings = await Borrowing.find({ user: user._id, createdAt: { $gte: moment().subtract(1, 'month') } });
        if (borrowings.length >= 3) {
            return res.status(400).json({ message: 'L\'utilisateur a déjà emprunté 3 livres ce mois-ci' });
        }

        const newBorrowing = new Borrowing({
            book: book._id,
            user: user._id
        });
        await newBorrowing.save();

        book.aviabilityCount--;
        await book.save();

        res.status(201).json(newBorrowing);
    } catch (err) {
        res.status(500).json({ message: err.message });
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
    if (req.body.title != null) { 
        res.borrowing.title = req.body.title
    }
    if (req.body.description != null) { 
        res.borrowing.description = req.body.description
    }
    if (req.body.publishedDate != null) { 
        res.borrowing.publishedDate = req.body.publishedDate
    }
    if (req.body.pageCount != null) { 
        res.borrowing.pageCount = req.body.pageCount
    }
    if (req.body.author != null) { 
        res.borrowing.author = req.body.author
    }

    if (req.body.copiesCount != null) { 
        res.borrowing.copiesCount = req.body.copiesCount
    }

    if (req.body.aviabilityCount != null) { 
        res.borrowing.aviabilityCount = req.body.aviabilityCount
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