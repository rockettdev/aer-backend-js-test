import path from "path"
import fs from "fs"
import { Request, Response } from "express"
import { ICompany } from "../interfaces/ICompany"
import { sanitiseCompany } from "../services/companySanitiser";
import { IEmployee } from "../interfaces/IEmployee";
import { z } from "zod"

// I use zod here to prevent parameter tampering
const getAllCompaniesQuerySchema = z.object({
    companyName: z.string().max(50).trim().optional(),
    employeeName: z.string().max(50).trim().optional(),
    limit: z.union([z.string().regex(/^\d+$/), z.literal("all")]).optional(),   // numeric string or "all"
    offset: z.string().regex(/^\d+$/).optional(),   // numeric string
    active: z.enum(["true", "false"]).optional()  // accept only "true" or "false"
}).strict();

const companiesDir = path.join(process.cwd(), "data", "companies");
const companyFiles = fs.readdirSync(companiesDir)

const employeesDir = path.join(process.cwd(), "data", "employees");
const employeeFiles = fs.readdirSync(employeesDir)

// Reads each file and parse its JSON into an array of companies
let companies: ICompany[] = companyFiles.flatMap(file => {
    const filePath = path.join(companiesDir, file)
    try {
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(raw)
        return sanitiseCompany(parsed)
    } catch (err) {
        console.error(`Invalid company JSON file: ${file}`, err)
        return []  // skip file if format is invalid
    }
})

let employees: IEmployee[] = employeeFiles.flatMap(file => {
    const filePath = path.join(employeesDir, file)
    try {
        const raw = fs.readFileSync(filePath, "utf-8")
        return JSON.parse(raw)
    } catch (err) {
        console.error(`Invalid employee JSON file: ${file}`, err)
        return [] // skip file if format is invalid
    }
})

// Merges the matching employees to the respective company - o(n*m)
companies.forEach(company => {
    company.employees = employees.filter(employee => employee.company_id === company.id)
})

export const getAllCompanies = (req: Request, res: Response) => {

    let filteredCompanies = [...companies];

    // Validate query
    const parsed = getAllCompaniesQuerySchema.safeParse(req.query);

    // Returns error if invalid query parameter is detected
    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid query parameters",
            details: parsed.error.issues
        });
    }

    const { companyName, employeeName, limit, offset, active: activeStr } = parsed.data;

    // Converts active query parameter from string to boolean
    const active = activeStr === "true" ? true : activeStr === "false" ? false : undefined;
    const numericLimit: number = limit === "all" ? filteredCompanies.length : parseInt(limit || "10");
    const numericOffset: number = parseInt(offset || "0");

    // Checks for undefined, since a simple boolean check would skip false values
    if (active !== undefined) {
        filteredCompanies = filteredCompanies.filter(c => c.active === active)
    }

    // Filter companies by companyName, case insensitive
    // Max length enforced by zod for DoS protection
    if (companyName) {
        filteredCompanies = filteredCompanies.filter(c => c.name && c.name.toLowerCase().includes(companyName))
    }

    // Filter employees by employeeName, remove companies with no matches
    // Max length enforced by zod
    if (employeeName) {
        filteredCompanies = filteredCompanies
            .map(company => {
                const matchingEmployees = company.employees?.filter(emp =>
                    emp.first_name.toLowerCase().includes(employeeName) ||
                    emp.last_name.toLowerCase().includes(employeeName)
                ) ?? [];

                return { ...company, employees: matchingEmployees };
            })
            .filter(company => company.employees.length > 0); // only keep companies that have matching employees
    }



    // Slice for pagination
    const paginatedCompanies = filteredCompanies.slice(numericOffset, numericOffset + numericLimit);

    const totalCount = filteredCompanies.length;

    // Calculates total page count, sets totalPages to 1 if limit is 0
    const totalPages = numericLimit === 0 ? 1 : Math.ceil(totalCount / numericLimit);

    res.json({
        meta: {
            total: totalCount,
            limit: numericLimit,
            offset: numericOffset,
            totalPages: totalPages
        },
        data: paginatedCompanies

    })
}

export const getCompanyById = (req: Request, res: Response) => {
    const id = parseInt(req.params.id)

    let companyList = [...companies]

    // Finds individual company entry
    const filteredCompany = companyList.find(c => c.id === id)

    // Returns 404 error if company is not found
    if (!filteredCompany) {
        return res.status(404).json({ error: "Company not found" });
    }

    res.json({ data: filteredCompany })
}