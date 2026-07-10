const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

async function register(req, res) {
    try {
        const { name, email, password, college } = req.body
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        if (result.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const query = `INSERT INTO users (name, email, password_hash, college) VALUES ($1,$2,$3,$4)`
        await pool.query(query, [name, email, hashedPassword, college])
        res.status(201).json({ message: "User registered successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" })
        }
        const user = result.rows[0]
        const validPassword = await bcrypt.compare(password, user.password_hash)
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

module.exports = { register, login }