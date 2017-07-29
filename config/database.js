module.exports = {
    // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot
  url:  process.env.MONGOLAB_URI || process.env.MONGODB_URI ||`mongodb://localhost:27017/passport`

}
