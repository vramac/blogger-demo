let mongoose = require('mongoose')
let crypto = require('crypto')
let nodeify = require('bluebird-nodeify')

let SALT = 'CodePathHeartNodeJS'

let userSchema = mongoose.Schema({
	username: {
		type: String,
		required: true
	},
  	email: {
  		type: String,
  		required: true
  	},
  	password: {
  		type: String,
  		required: true
  	},
  	blogTitle: {
  		type: String,
  		required: true
  	},
  	blogDescription: {
  		type: String,
  		required: true
  	}
})

userSchema.methods.generateHash = async function(password) {
  	return (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex')
}

userSchema.methods.validatePassword = async function(password) {
	let passwordHash = (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 
		'sha256')).toString('hex')
   	if (passwordHash !== this.password) {
    	return false
   	}
   	return true
}

userSchema.pre('save', function(callback) {
	console.log("this.isModified: " + this)
	nodeify(async () => {
		if (!this.isModified('password')) {
			return callback()
		}
		this.password = await this.generateHash(this.password)
		console.log("this.password: hash" + this.password)
	}(), callback)
})

userSchema.path('password').validate( (pw) => {
	return pw.length >=4 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw)
})


module.exports = mongoose.model('User', userSchema)
