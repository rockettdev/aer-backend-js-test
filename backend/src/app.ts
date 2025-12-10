import express from "express";
import companiesRouter from "./routes/companies";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const app = express();

app.use(express.json());

// Load Swagger YAML
const swaggerPath = path.join(__dirname, "../docs/openapi.yaml");
const swaggerDocument = yaml.load(fs.readFileSync(swaggerPath, "utf8")) as Record<string, unknown>;
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { error: "Too many requests from client, please try again later." }
});
app.use(limiter);

app.use("/companies", companiesRouter);

export default app;
