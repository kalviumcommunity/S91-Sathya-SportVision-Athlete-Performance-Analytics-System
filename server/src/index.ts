import 'dotenv/config'
import mongoose from 'mongoose'
import { createApp } from './app.js'

const port = Number(process.env.PORT ?? 3000)
const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  throw new Error('MONGODB_URI must be set before starting the server.')
}

await mongoose.connect(mongoUri)
console.log('Connected to MongoDB.')

const app = createApp()

app.listen(port, () => {
  console.log(`SportVision API listening on port ${port}.`)
})
