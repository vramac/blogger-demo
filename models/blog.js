let mongoose = require('mongoose')

let blogSchema = mongoose.Schema({
  author: {
    type: String,
    required: true
  },
	title: {
		type: String,
		required: true
	},
  description: {
  		type: String,
  		required: true
  }
})


module.exports = mongoose.model('Blog', blogSchema)