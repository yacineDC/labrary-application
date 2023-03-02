const mongoose = require('mongoose')


const bookSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true
      },
      description: {
        type: String
      },
      publishedDate: {
        type: Date,
        required: true
      },
      pageCount: {
        type: Number,
        required: true
      },
      author: {
        type: String,
        required: true,
      },
      copiesCount: {
        type: Number,
        required: true
      },
      aviabilityCount: {
        type: Number,
        required: true
      },

      
    },
    // Options
  )

module.exports = mongoose.model('book', bookSchema)
  
