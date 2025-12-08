import express from "express"
import rateLimit from 'express-rate-limit'
import companiesRouter from "./routes/companies";

const app = express();

// Limit each IP to 60 requests per minute
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
        error: "Too many requests from client, please try again later."
    }
})

app.use(limiter)

app.use(express.json())

app.use("/companies", companiesRouter)

app.listen(4000, () => console.log("Server Running."))