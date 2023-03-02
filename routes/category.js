const express = require ('express')
//geting the router from express
const router = express.Router()
const Category = require('../models/category')


// Geting all 
router.get('/', async (req, res) => {
try {
    const Categories = await Category.find()
    res.json(Categories)
} catch (err) {
  res.status (500).json({message: err.message})  
}
})

//Getting one 
router.get('/:id', getCategory, (req, res) => {
    res.json(res.category)
})

//Creating one 
router.post('/', async (req, res) => {
    const newCategory = new Category({
        
        name: req.body.name,
    
    })
    try{
        await newCategory.save()
        res.status(201).json(newCategory)

    } catch (err) {
        res.status(400).json({message:err.message})
    }

})
//updating one
router.patch('/:id', getCategory, async (req, res) => {
    
    if (req.body.name != null) { 
        res.category.name = req.body.name
    }
    
    try {
        const updatedCategory = await res.category.save()
        res.json(updatedCategory )
    } catch (err) {
        res.status(400).json({message:err.message})
    }
})


//Deleting one 
router.delete('/:id', getCategory, async (req, res) => {
    try {
        await res.category.remove()
        res.json({message: 'Deleted category'})

    }catch (err) {
        res.status(500).json({message:err.message})
    }
   
})
// midle whare fonction

async function getCategory (req, res, next) {
    let category
    try{
        category = await Category.findById(req.params.id) 
        if (category == null) {
            return res.status(404).json({message: 'Cannot find category'})

        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    res.category = category
    next()

}


module.exports= router