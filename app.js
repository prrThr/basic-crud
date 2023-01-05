// --- Imports --- //
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

// --- Config JSON --- //
app.use(express.json())

// --- Models ---
const User = require('./models/User')

// --- Public route --- //
app.get('/', (req, res) => {
    res.status(200).json({ msg: "Bem vindo a nossa API!" })
})

// --- Private route --- //
app.get('/user/:id', checkToken, async (req, res) => {
    const id = req.params.id

    // Check if user exists
    const user = await User.findById(id, '-password')

    if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado!" })
    }

    res.status(200).json({ user })
})

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ msg: "Acesso negado!" })
    }

    try {
        const secret = process.env.SECRET
        jwt.verify(token, secret)

        next()
    } catch (err) {
        res.status(400).json({ msg: "Token inválido!" })
    }
}

// --- Register user --- //
app.post('/auth/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body

    // --- Validations --- //
    if (!name) {
        return res.status(422).json({ msg: "O nome é obrigatório!" })
    }
    if (!email) {
        return res.status(422).json({ msg: "O email é obrigatório!" })
    }
    if (!password) {
        return res.status(422).json({ msg: "A senha é obrigatória!" })
    }

    if (password !== confirmpassword) {
        return res.status(422).json({ msg: "As senhas não conferem!" })
    }


    // --- Check if user existis --- //
    const userExists = await User.findOne({ email: email })
    if (userExists) {
        return res.status(422).json({ msg: "O email já está sendo utilizado, use outro!" })
    }

    // --- Create Password --- //
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // --- Create User --- //
    const user = new User({
        name,
        email,
        password: passwordHash
    })

    try {
        await user.save()
        res.status(201).json({ msg: "Usuário criado com sucesso!" })
    } catch (err) {
        return res.status(500).json({ msg: "Ocorreu um erro: " + err })
    }

})

// --- Login --- //
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body

    // --- Validations --- //
    if (!email) {
        return res.status(422).json({ msg: "O email é obrigatório!" })
    }
    if (!password) {
        return res.status(422).json({ msg: "A senha é obrigatória!" })
    }

    // --- Check if user existis --- //
    const user = await User.findOne({ email: email })
    if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado!" })
    }

    // --- Check if password match --- //
    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
        return res.status(422).json({ msg: "Senha inválida!" })
    }

    try {
        const secret = process.env.SECRET
        const token = jwt.sign({
            id: user._id
        },
            secret,
        )
        res.status(200).json({ msg: "Autenticação realizada com sucesso!", token })
    } catch (err) {
        return res.status(422).json({ msg: "Ocorreu um erro: " + err })
    }
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

