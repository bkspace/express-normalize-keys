import express from 'express'
import normalizeKeys from '../lib/normalize-keys'

const app = express()

const options = {
  target: 'query',
  convert: 'camel'
}

app.get('/', normalizeKeys.normalize(options), (req, res) => {
  res.send(req.query)
})

app.listen(4000)
