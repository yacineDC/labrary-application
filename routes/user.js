const express = require ('express')
//geting the router from express
const router = express.Router()
const User = require('../models/user')


// Geting all user
router.get('/', async (req, res) => {
try {
    const Users = await User.find()
    res.json(Users)
} catch (err) {
  res.status (500).json({message: err.message})  
}
})

//Getting one user
router.get('/:id', getUser, (req, res) => {
    res.json(res.user)
})

//Creating one user
router.post('/', async (req, res) => {
    const newUser = new User({
        username:req.body.username,
        password: req.body.password,
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        role: req.body.role,
    
    })
    try{
        await newUser.save()
        res.status(201).json(newUser)

    } catch (err) {
        res.status(400).json({message:err.message})
    }

})
//updating one
router.patch('/:id', getUser, async (req, res) => {
    if (req.body.username != null) { 
        res.user.username = req.body.username
    }
    if (req.body.password != null) { 
        res.user.password = req.body.password
    }
    if (req.body.email != null) { 
        res.user.email = req.body.email
    }
    if (req.body.name != null) { 
        res.user.name = req.body.name
    }
    if (req.body.surname != null) { 
        res.user.surname = req.body.surname
    }

    if (req.body.phoneNumber != null) { 
        res.user.phoneNumber = req.body.phoneNumber
    }

    if (req.body.address != null) { 
        res.user.address = req.body.address
    }

    if (req.body.role != null) { 
        res.user.role = req.body.role
    }

    try {
        const updatedUser = await res.user.save()
        res.json(updatedUser )
    } catch (err) {
        res.status(400).json({message:err.message})
    }
})


//Deleting one 
router.delete('/:id', getUser, async (req, res) => {
    try {
        await res.user.remove()
        res.json({message: 'Deleted User'})

    }catch (err) {
        res.status(500).json({message:err.message})
    }
   
})
// midle whare fonction

async function getUser (req, res, next) {
    let user
    try{
        user = await User.findById(req.params.id) 
        if (user == null) {
            return res.status(404).json({message: 'Cannot find user'})

        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    res.user = user
    next()

}


module.exports= router