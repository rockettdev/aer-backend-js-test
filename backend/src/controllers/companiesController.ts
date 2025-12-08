import path from "path"
import fs from "fs"
import { Request, Response } from "express"
import { ICompany } from "../interfaces/ICompany"
import { sanitiseCompany } from "../services/companySanitiser";
// import { IEmployee } from "../interfaces/IEmployee";
// import companySchema  from "../schema/companies.json";
// import employeesSchema from "../schema/employees.json";

const companiesDir = path.join(process.cwd(), "data", "companies");

const companyFiles = fs.readdirSync(companiesDir)

// Reads each file and parse its JSON into an array of companies
let companies: ICompany[] = companyFiles.flatMap(file => {
    const filePath = path.join(companiesDir, file)
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
    return sanitiseCompany(data)
})

export const getAllCompanies = (req: Request, res: Response) => {

    let filteredCompanies = [...companies];

    // Receives name filter request from API
    // Checks for name filter included in API request
    const nameFilter = (req.query.name as string)?.toLowerCase() || "" // to lowercase for case insensitive matching
    if (nameFilter) {
        filteredCompanies = filteredCompanies.filter(c => c.name && c.name.toLowerCase().includes(nameFilter)) // to lowercase for case insenstive matching
    }

    // Receives limit from API request; supports 'all' to return all companies, defaults to 10 when no limit is provided
    const limit = req.query.limit === "all" ? filteredCompanies.length : parseInt(req.query.limit as string) || 10;

    // Receives offset from API request
    const offset = parseInt(req.query.offset as string) || 0

    // Slice for pagination
    const paginatedCompanies = filteredCompanies.slice(offset, offset + limit)

    const totalCount = filteredCompanies.length;

    // Calculates total page count, sets totalPages to 1 if limit is 0
    const totalPages = limit === 0 ? 1 : Math.ceil(totalCount / limit);

    res.json({
        meta: {
            total: totalCount,
            limit: limit,
            offset: offset,
            totalPages: totalPages
        },
        data: paginatedCompanies

    })
}

export const getCompanyById = (req: Request, res: Response) => {
    const id = parseInt(req.params.id)

    let companyList = [...companies]

    // Finds individual company entry
    let filteredCompany = companyList.find(c => c.id === id)

    // Returns 404 error if company is not found
    if (!filteredCompany) {
        return res.status(404).json({ error: "Company not found" });
    }

    res.json({ data: filteredCompany })
}