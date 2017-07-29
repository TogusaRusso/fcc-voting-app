const polls = require("./controllers/polls")
module.exports = function (app, passport) {


  app.get('/', function (req, res) {
    // get the user out of session and pass to template
    res.locals.user = req.user
    polls.all((err, polls) => {
      if (err) throw err
      res.render('index', {polls})
    })
  })

  app.route('/login')
    .get( (req, res) => {
      res.locals.message = req.flash('loginMessage')
      // render the page and pass in any flash data if it exists
      res.render('login')
    })
    .post(passport.authenticate('local-login', {
        // redirect to the secure profile section
        successRedirect : '/',
        // redirect back to the signup page if there is an error
        failureRedirect : '/login', 
        // allow flash messages
        failureFlash : true 
    }))

  app.route('/signup')
    .get((req, res) => {
      // render the page and pass in any flash data if it exists
      res.locals.message = req.flash('signupMessage')
      res.render('signup')
    })
    .post(passport.authenticate('local-signup', {
      // redirect to the secure profile section
      successRedirect: '/',
      // redirect back to the signup page if there is an error
      failureRedirect: '/signup',
      // allow flash messages
      failureFlash: true
    }))

  app.get('/profile', isLoggedIn, (req, res) =>
    // get the user out of session and pass to template
    //res.locals.user = req.user
    res.render('profile')
  )

  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  // Polls part
  app.route('/polls/new')
    .get(isLoggedIn, (req, res) =>
      res.render('newPoll')
    )
    .post(isLoggedIn, (req, res) => {
      if(!req.body.question || !req.body.option1 
      || !req.body.option2 || req.body.option1 == req.body.option2)
        return res.redirect('/polls/new')
      const poll = {
        question: req.body.question,
        options: [
          {text: req.body.option1, votes: 0},
          {text: req.body.option2, votes: 0}
          ],
        createdBy: req.user.local.email
      }
      polls.newPoll(poll, (err, poll) => {
        if (err) throw err
        res.redirect('/polls/' + poll._id)
      })
    })
  app.get('/polls/my', isLoggedIn, (req, res) => {
    polls.byUser(req.user.local.email, (err, polls) => {
      if (err) throw err
      res.render('index', {polls})
    })
  })
  app.route('/polls/:id')
    .get((req, res) => polls.byId(req.params.id, (err, poll) => {
      if (err) throw err
      res.locals.user = req.user
      res.render('poll', poll)
    }))
    .post(isLoggedIn, (req, res) => polls.byId(req.params.id, (err, poll) => {
      if (err) throw err
      if(!req.body.option) return res.redirect('/polls/' + req.params.id)
      poll.options.push({text: req.body.option, votes: 0})  
      polls.update(poll, err => {
        if (err) throw err
        res.redirect('/polls/' + req.params.id)
      })
    }))
  app.route('/polls/delete/:id')
    .get(isLoggedIn, (req, res) => polls.byId(req.params.id, (err, poll) => {
      if (err) throw err
      if (!req.user || req.user.local.email !== poll.createdBy)
        return res.redirect('/')
      polls.deleteById(req.params.id, err => {
        if (err) throw err
        res.redirect('/')}
      )
    }))
  app.get('/polls/vote/:id/:option', (req, res) => 
    polls.byId(req.params.id, (err, poll) => {
      if (err) throw err
      res.locals.user = req.user
      poll.options[req.params.option].votes += 1  
      polls.update(poll, err => {
        if (err) throw err
        res.redirect('/polls/result/' + req.params.id)
      })
    })
  )
  app.get('/polls/result/:id', (req, res) => 
    polls.byId(req.params.id, (err, poll) => {
      if (err) throw err
      res.locals.user = req.user
      const labels = poll.options.map(item => item.text)
      const data = poll.options.map(item => item.votes)
      res.render('result', {
        question: poll.question,
        _id: poll._id,
        labels: JSON.stringify(labels),
        data: JSON.stringify(data)
      })
    })
  )
}



// route middleware to make sure a user is logged in
function isLoggedIn (req, res, next) {
    // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) { 
    // get the user out of session and pass to template
    res.locals.user = req.user
    return next() 
  }
    // if they aren't redirect them to the home page
  res.redirect('/')
}
