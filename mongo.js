const process = require('process')
require('dotenv').config()
const mongoose = require('mongoose')
const Person = require('./models/person')

const name = process.argv[2]
const number = process.argv[3]

// Decided to hide everything related to connection string
// ADD Person:
// node mongo.js personName number

// GET Persons:
// node mongo.js


mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGO_CONNECT)

if (process.argv.length ===4){
  const person = new Person({
    name:name,
    number:number
  })
  person.save().then(r=>{
    console.log(`added ${r.name} number ${r.number}`)
    mongoose.connection.close()
  })
}else{
  Person.find({}).then(result=>{
    console.log('phonebook:')
    result.forEach(person=>{
      console.log(person.name +' '+person.number)
    })
    mongoose.connection.close()
  })
}
