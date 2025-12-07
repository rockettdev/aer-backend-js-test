import express from "express"
import { getAllCompanies, getCompanyById } from "../controllers/companiesController"

const router = express.Router();

// routes
router.get("/", getAllCompanies)
router.get("/:id", getCompanyById)

export default router;