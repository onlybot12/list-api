const express = require("express")
const { MongoClient } = require("mongodb")
const path = require("path")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Maulanaa:5q1PrEZUUJkY4ioF@cluster0.rgcpg7g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

let db

// Connect to MongoDB
MongoClient.connect(MONGODB_URI)
  .then((client) => {
    console.log("Connected to MongoDB")
    db = client.db()
  })
  .catch((error) => console.error("MongoDB connection error:", error))

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"))
})

app.get("/list", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

// Get all APIs
app.get("/api/api", async (req, res) => {
  try {
    const apis = await db.collection("apiss").find({}).toArray()
    res.json(apis)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch APIs" })
  }
})

// Add new API
app.post("/api/apis", async (req, res) => {
  try {
    const { name, developer, url, status, description, auth } = req.body

    if (!name || !developer || !url || !status || !description || !auth) {
      return res.status(400).json({ error: "All fields are required" })
    }

    const newApi = {
      name,
      developer,
      url,
      status,
      description,
      auth,
      createdAt: new Date(),
    }

    const result = await db.collection("apiss").insertOne(newApi)
    res.status(201).json({ message: "API added successfully", id: result.insertedId })
  } catch (error) {
    res.status(500).json({ error: "Failed to add API" })
  }
})

// Delete API
app.delete("/api/apis/:id", async (req, res) => {
  try {
    const { ObjectId } = require("mongodb")
    const result = await db.collection("apiss").deleteOne({ _id: new ObjectId(req.params.id) })

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "API not found" })
    }

    res.json({ message: "API deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete API" })
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
