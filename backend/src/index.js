const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourismchain')

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/places', require('./routes/places'))
app.use('/api/visits', require('./routes/visits'))
app.use('/api/leaderboard', require('./routes/leaderboard'))
app.use('/api/nfts', require('./routes/nfts'))
app.use('/api/actions', require('./routes/actions'))

// Start server for local development only
// Vercel serverless requires module.exports = app
if (require.main === module) {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
}

module.exports = app
