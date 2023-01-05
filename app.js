// --- imports --- //
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

// --- Routes --- //
app.get('/', (req, res) => {
    res.status(200).json({ msg: "Bem vindo a nossa API!" })
})

app.post('/auth/register', async (req, res) => {

})



// --- Credencials --- //
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS


// --- Database --- //
mongoose.set("strictQuery", true)
mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.ucqn4ht.mongodb.net/?retryWrites=true&w=majority`
)
    .then(() => {
        app.listen(8080)
        console.log("Conectado ao banco de dados!")
    })
    .catch((err) => console.log("error: " + err))

