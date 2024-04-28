import express from 'express'
import cookieParser from 'cookie-parser'
// import bodyParser from 'body-parser'
import fs from 'fs'
import loadstore from './api/loadstore.js'
import clearstore from './api/clearstore.js'
import product from './api/product.js'
import store from './api/store.js'
import storereport from './api/storereport.js'

const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')

  next()
}

const port = 3000
const app = express()

// app.use(bodyParser.json({ limit: '50mb' }))
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
app.use(express.json())
app.use(allowCrossDomain)
app.use(cookieParser())
app.use(express.static('dist'))

app.get('/api/loadstore', loadstore)
app.get('/api/clearstore', clearstore)
app.get('/api/product', product)
app.get('/api/store', store)
app.get('/api/storereport', storereport)

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) console.log(err)
  console.info('Local server on port %s.', port)
})
