let fs = require('fs')
let then = require('express-then')
let multiparty = require('multiparty')
let Blog = require('./models/blog')
let Post = require('./models/post')
let Comment = require('./models/comment')
let util = require('util');

require('songbird')

let isLoggedIn = require('./middleware/isLoggedIn')

module.exports = (app) => {
  let passport = app.passport

  app.get('/', (req, res) => {
    res.render('index.ejs')
  })

  app.get('/login', (req, res) => {
    res.render('login.ejs', {message: req.flash('error')})
  })

  app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }))

  app.get('/signup', (req, res) => {
    res.render('signup.ejs', {message: req.flash('error')})
  })

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }))

  app.get('/profile', isLoggedIn, then(async(req, res) => {
    let blog = await Blog.promise.findOne({author: req.user.username})
    res.render('profile.ejs', {
      user: req.user,
      blog: blog,
      message: req.flash('error')
    })
  }))

  app.get('/blog/:blogId', isLoggedIn, then(async(req, res) => {
    let blogId = req.params.blogId
    let posts = await Post.promise.find({blogId: blogId})
    res.render('blog.ejs', {
      posts: posts,
      message: req.flash('error')
    })
  }))

  app.get('/post/:postId?', then(async(req,res) => {
    let postId = req.params.postId
    if (!postId) {
      res.render('post.ejs', {
        post: {},
        verb: 'Create'
      })
      return
    }
    else {
      let post = await Post.promise.findById(postId)

      if (!post) 
        res.send('404','not Found')
      console.log("Found a match PostId: " + postId + ", post: " + post) 
      res.render('post.ejs',{
        post: post,
        verb: 'Edit'
      })
    }
  }))

  app.post('/post/:postId?', then(async (req,res) => {
    let postId = req.params.postId
    let blog = await Blog.promise.findOne({author: req.user.username})
    console.log("Blog in app.post: " + blog._id)
    if (!postId) {
      let post = new Post()
      let [ {title: [title], content: [content]}, {image: [file]}] = await new multiparty.Form().promise.parse(req)
      post.blogId = blog._id
      post.title = title
      post.content = content
      post.image.data = await fs.promise.readFile(file.path)
      post.image.contentType = file.headers['content-type']
      console.log(post.title,post.content,post.image)
      await post.save()
      res.redirect('/blog/' + encodeURI(post.blogId))
      return
    }
    let post = await Post.promise.findById(postId)
    if (!post) 
      res.send('404','Not Found')
    let [ {title: [title], content: [content]}, {image: [file]}] = await new multiparty.Form().promise.parse(req)
    post.title = title
    post.content = content
    await post.save()
    res.redirect('/blog/:blogId' + encodeURI(post.blogId))
  }))

  app.get('/postDetails/:postId', then(async(req,res) => {
    let postId = req.params.postId
    let post = await Post.promise.findById(postId)
    let comments = await Comment.promise.find({postId:postId})
    console.log("Found a match PostId: " + postId + ", post: " + post) 
    res.render('postdetails.ejs',{
      post: post,
      comments: comments
    })
  }))

  app.post('/postComments/:postId', then(async(req,res) => {
    let postId = req.params.postId
    let comment = new Comment()
    comment.postId = postId
    comment.userId = req.user.username
    let content = req.body.content
    comment.content = content
    console.log("Comments: " + content)
    await comment.save();
    let comments = await Comment.promise.find({postId:postId})
    res.redirect('/postDetails/' + encodeURI(postId))
  }))

  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })
}
