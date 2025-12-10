import { ICompany } from "../interfaces/ICompany"

// Allows optional leading +, digits, spaces, parentheses, and internal dashes
// Must be 5-20 characters, cannot start or end with dash
const phoneRegex = /^(?!-)\+?[0-9\s()-]{5,20}(?<!-)$/;

/**
 * Checks if a company's telephone number is valid
 * Rejects numbers that start or end with a dash, and enforces a length of 5-20 characters
 * 
 * @param companyName - The name of the company (used in console warnings)
 * @param companyTelephone - The telephone number to validate
 * @returns `true` if the telephone number passes validation, `false` otherwise
 */
function isValidPhone(companyName: string, companyTelephone: string): boolean {
    const valid = phoneRegex.test(companyTelephone);
    if (!valid) {
        console.warn(`Sanitisation: Company "${companyName}" has an invalid telephone number: ${companyTelephone}. Replaced with "".`);
    }
    return valid;
}

/**
 * Trims a string and provides a fallback if it is empty or undefined
 *
 * @param str - The string to clean. Can be undefined
 * @param fallback - The value to return if str is undefined, null, or only whitespace. Defaults to an empty string
 * @returns The trimmed string if it has content; otherwise the fallback value
 */
function cleanString(str?: string, fallback = ""): string {
    return str && str.trim() ? str.trim() : fallback;
}


/**
 * Sanitises an array of company objects
 * Removes entries missing critical fields and ensures defaults for optional fields
 * Validates telephone numbers and replaces invalid ones with "n/a" using the isValidPhone method
 * 
 * @param companies - Array of partial ICompany objects
 * @returns Array of sanitised ICompany objects
 */
export function sanitiseCompany(companies: Partial<ICompany>[]): ICompany[] {
    const clean: ICompany[] = [];

    for (const company of companies) {

        if (!company.id || !company.name) {
            console.warn(`Rejected company entry due to missing critical field:`, company);
            continue;
        }

        clean.push({
            id: company.id,
            name: cleanString(company.name),
            industry: cleanString(company.industry, "n/a"),
            active: company.active ?? false,
            website: cleanString(company.website),
            telephone: company.telephone && isValidPhone(company.name, company.telephone) ? company.telephone.trim() : "",
            slogan: cleanString(company.slogan),
            address: cleanString(company.address),
            city: cleanString(company.city),
            country: cleanString(company.country)
        });
    }
    return clean;
}