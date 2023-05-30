import express from "express"
import cors from "cors"
import axios from "axios"
import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})

const app = express()

app.use(express.json())
app.use(cors())

app.post("/image", async (req, res) => {
  const { text } = req.body

  const response = await axios.get(
    `https://v1.slashapi.com/shahmir/qr-code/7OUNqcFrtQ?text=${text}`,
    {
      responseType: "arraybuffer"
    }
  )

  const imageData = Buffer.from(response.data, "binary").toString("base64")

  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${imageData}`
  )

  res.json({
    image: result.secure_url
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server is listening at ${PORT}`))
