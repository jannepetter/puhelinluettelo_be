const process = require('process')
require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', function (req,) { 
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_URI)

const errorHandler = (error, request, response, next) => {
  const extractor =(errors)=>{
    let errorList = []
    for (const error in errors) {
      errorList.push({
        field:error,
        name:errors[error]['name'],
        msg:errors[error]['message']
      })
    }
    return errorList
  }

  if (error.name === 'CastError') {
    return response.status(400).send({ 
      field:'id',
      name: 'CastError',
      msg:'malformatted id'
    })
  }else if (error.name === 'ValidationError'){
    return response.status(400).send(extractor(error.errors))
  }

  next(error)
}

app.get('/info', (request, response) => {
  const dateNow = new Date().toString()
  Person.find({}).then(result=>{
    return response.send(`<p>Phonebook has info for ${result.length} people</p><p>${dateNow}</p>`)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result=>{
    return response.json(result)
  })
})

app.get('/api/persons/:id', (request, response,next) => {
  const personId = request.params.id

  Person.findById({_id:personId}).then(person=>{
    if (person){
      return response.json(person)
    }
  }).catch(err=>{
    next(err)
  })
})

app.delete('/api/persons/:id', (request, response,next) => {
  const personId = request.params.id
  Person.deleteOne({_id:personId}).then(person=>{
    if (person){
      return response.sendStatus(204)
    }
  }).catch(err=>{
    next(err)
  })
})

app.post('/api/persons', (request, response,next) => {
  const data = request.body
  const person = new Person({
    name:data.name,
    number:data.number
  })
  person.save().then(result=>{
    return response.json(result)
  }).catch(err=>{
    next(err)
  })
})

app.put('/api/persons/:id',(request, response, next)=>{
  const personId = request.params.id
  const data = request.body
  Person.findByIdAndUpdate({_id:personId},data,{new:true,runValidators: true}).then(result=>{
    return response.json(result)
  }).catch(err=>{
    next(err)
  })
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})