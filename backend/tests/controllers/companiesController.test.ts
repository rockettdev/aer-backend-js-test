jest.spyOn(console, 'warn').mockImplementation(() => {});
import request from "supertest";
import app from "../../src/app";
import { ICompany } from "../../src/interfaces/ICompany";

describe("GET /companies", () => {
    
    it("should return 200 and JSON structure", async () => {
        const res = await request(app).get("/companies");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("meta");
        expect(res.body).toHaveProperty("data");
    });

    it("should filter by active status", async () => {
        const res = await request(app).get("/companies?active=false");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);

        // check no "active: true" sneaks through
        const invalid = res.body.data.find((company: ICompany) => company.active === true);
        expect(invalid).toBeUndefined();
    });
});

describe("GET /companies/:id", () => {
    it("should return single company when id exists", async () => {
        const res = await request(app).get("/companies/1");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("data");
        expect(res.body.data.id).toBe(1);
    });

    it("should return 404 when company does not exist", async () => {
        const res = await request(app).get("/companies/999999");

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("Company not found");
    });
});
