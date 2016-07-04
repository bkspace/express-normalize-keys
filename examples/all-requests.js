import express from 'express'
import normalizeKeys from '../lib/normalize-keys'

const app = express()

const options = {
  target: 'query',
  convert: 'camel'
}

app.use(normalizeKeys.normalize(options))

app.get('/', (req, res) => {
  res.send(req.query)
})

app.listen(4000)
