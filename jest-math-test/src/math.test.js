const { square } = require("./math");

describe("square function", () => {
    test("can square two", () => {

        const result = square(2);
        expect(result).toBe(4);
    });

    test("can square zero", () => {     //edge case
        const result = square(0);
        expect(result).toBe(0);
    })

    test("can square negative", () => {
        const result = square(-2);
        expect(result).toBe(4);
    })
});