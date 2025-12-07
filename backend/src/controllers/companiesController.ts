import path from "path"
import fs from "fs"
import { Request, Response } from "express"


const companiesDir = path.join(process.cwd(), "data", "companies");


export const getAllCompanies = (req: Request, res: Response) => {
    res.json({ message: "getAllCompanies not implemented" })
}

export const getCompanyById = (req: Request, res: Response) => {
    const id = req.params.id
    res.json({ id })
}