import express from "express"
import companiesRouter from "./routes/companies";

const app = express();
app.use(express.json())

app.use("/companies", companiesRouter)

app.listen(4000, () => console.log("Server Running."))