import { isBlank } from "../utils";

describe("Utils.ts 테스트", () => {
	it("isBlank 테스트", () => {
		expect(isBlank(" ")).toBe(true);
		expect(isBlank("test")).toBe(false);
		expect(isBlank("test ")).toBe(false);
		expect(isBlank(" test")).toBe(false);
	});
});
