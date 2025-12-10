jest.spyOn(console, 'warn').mockImplementation(() => {});
import { sanitiseCompany } from "../../src/services/companySanitiser";
import { ICompany } from "../../src/interfaces/ICompany";

describe("sanitiseCompany", () => {
    it("returns a fully sanitised company object", () => {
        const raw: Partial<ICompany> = {
            id: 10,
            name: "TestCorp ",
            telephone: "-12345",
            active: true,
            industry: "",
            website: "",
            slogan: " Test Slogan.",
            address: "",
            city: "",
            country: ""
        };

        const result = sanitiseCompany([raw]);

        expect(result).toEqual([{
            id: 10,
            name: "TestCorp",
            telephone: "",
            active: true,
            industry: "n/a",
            website: "",
            slogan: "Test Slogan.",
            address: "",
            city: "",
            country: ""
        }]);
    });
});