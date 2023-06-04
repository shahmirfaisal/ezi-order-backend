import express from "express"
import cors from "cors"
import axios from "axios"
import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"
import Stripe from "stripe"

dotenv.config()

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})

const app = express()

app.use(express.json())
app.use(cors())

app.post("/image", async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" })
  }
})

app.post("/create-payment-intent", async (req, res) => {
  const { price } = req.body

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: price * 100,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true
    }
  })

  res.json({
    clientSecret: paymentIntent.client_secret
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server is listening at ${PORT}`))
