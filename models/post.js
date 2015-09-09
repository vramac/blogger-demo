let mongoose = require('mongoose')

let postSchema = mongoose.Schema({
	blogId: {
		type: mongoose.Schema.ObjectId,
		required: true
	},
	title: {
		type: String,
		required: true
	},
  	content: {
  		type: String,
  		required: true
  	},
  	image: {
  		data: Buffer,
  		contentType: String
  	}
})


module.exports = mongoose.model('Post', postSchema)
