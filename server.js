'use strict'
const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('connect-flash')

const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')

// connect to our database
const configDB = require('./config/database.js')
mongoose.connect(configDB.url, { useMongoClient: true })
// pass passport for configuration
require('./config/passport')(passport)

// set up our express application
// log every request to the console
app.use(morgan('dev'))
// read cookies (needed for auth)
app.use(cookieParser())
// get information from html forms
app.use(bodyParser())

// set up ejs for templating
app.set('view engine', 'pug')

// required for passport
// session secret
app.use(session({ secret: 'ilovescotchscotchyscotchsnotch' }))
app.use(passport.initialize())
// persistent login sessions
app.use(passport.session())
// use connect-flash for flash messages stored in session
app.use(flash())

// routes
// load our routes and pass in our app and fully configured passport
require('./app/routes.js')(app, passport)

// launch
app.listen(port)
console.log('The magic happens on port ' + port)
