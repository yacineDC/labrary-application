const express = require ('express')
//geting the router from express
const router = express.Router()
const Book = require('../models/book')


// Geting all 
router.get('/', async (req, res) => {
try {
    const Books = await Book.find()
    res.json(Books)
} catch (err) {
  res.status (500).json({message: err.message})  
}
})

//Getting one 
router.get('/:id', getBook, (req, res) => {
    res.json(res.book)
})

//Creating one 
router.post('/', async (req, res) => {
    const newBook = new Book({
        title:req.body.title,
        description: req.body.description,
        publishedDate: req.body.publishedDate,
        pageCount: req.body.pageCount,
        author: req.body.author,
        copiesCount: req.body.copiesCount,
        aviabilityCount: req.body.aviabilityCount,
    
    })
    try{
        await newBook.save()
        res.status(201).json(newBook)

    } catch (err) {
        res.status(400).json({message:err.message})
    }

})
//updating one
router.patch('/:id', getBook, async (req, res) => {
    if (req.body.title != null) { 
        res.book.title = req.body.title
    }
    if (req.body.description != null) { 
        res.book.description = req.body.description
    }
    if (req.body.publishedDate != null) { 
        res.book.publishedDate = req.body.publishedDate
    }
    if (req.body.pageCount != null) { 
        res.book.pageCount = req.body.pageCount
    }
    if (req.body.author != null) { 
        res.book.author = req.body.author
    }

    if (req.body.copiesCount != null) { 
        res.book.copiesCount = req.body.copiesCount
    }

    if (req.body.aviabilityCount != null) { 
        res.book.aviabilityCount = req.body.aviabilityCount
    }

    try {
        const updatedBook = await res.book.save()
        res.json(updatedBook )
    } catch (err) {
        res.status(400).json({message:err.message})
    }
})


//Deleting one 
router.delete('/:id', getBook, async (req, res) => {
    try {
        await res.book.remove()
        res.json({message: 'Deleted Book'})

    }catch (err) {
        res.status(500).json({message:err.message})
    }
   
})
// midle whare fonction

async function getBook (req, res, next) {
    let book
    try{
        book = await Book.findById(req.params.id) 
        if (book == null) {
            return res.status(404).json({message: 'Cannot find book'})

        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    res.book = book
    next()

}


module.exports= router