const express = require('express')
var morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', function (req, res) { 
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": "1"
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": "2"
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": "3"
      },
      {
        "name": "Mary Poppendick",
        "number": "39-23-6423122",
        "id": "4"
      }
]

app.get('/info', (request, response) => {
    const dateNow = new Date().toString()
    return response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${dateNow}</p>`)
})

app.get('/api/persons', (request, response) => {
  return response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const personId = request.params.id
  const person = persons.find(p=>p.id === personId)
  if (person){
    return response.json(person)
  }
  return response.sendStatus(404)
})

app.delete('/api/persons/:id', (request, response) => {
  const personId = request.params.id
  const person = persons.find(p=>p.id === personId)
  if (person){
    persons = persons.filter(p=>p.id !== person.id)
    return response.sendStatus(204)
  }
  return response.sendStatus(404)
})

app.post('/api/persons', (request, response) => {
  const data = request.body
  if(!data.name || !data.number){
    return response.status(400).json({error:"name or number missing"})
  }else if (persons.some(p=>p.name.toLowerCase() === data.name.toLowerCase())){
    return response.status(400).json({error:"name must be unique"})
  }
  const id = Math.floor(Math.random()*1000000)
  data.id = id.toString()
  persons.push(data)
  return response.status(201).json(data)
})

app.put('/api/persons/:id',(request, response)=>{
  const personId = request.params.id
  const data = request.body
  const idx = persons.findIndex(p=>p.id === personId)
  persons[idx] = data
  return response.status(200).json(data)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})