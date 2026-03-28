// Import your code from dist directory, tests are not built on purpose
import { rootDep, doStuff } from "../dist/index.js"
import { doSubmoduleStuff } from "../dist/submodule/index.js"
// Import small testing lib from tsp
import { describe, test, expect, startTest } from "@reflex-stack/tsp/tests"

const endTest = startTest()

describe("Main module", () => {
	test("Should has root dependency", () => {
		expect(rootDep).toBe("root dependency")
	})
	test("Should call doStuff", () => {
		expect(doStuff()).toBe("Do stuff common dependency")
	})
})

describe("Sub module", () => {
	test("Should call doSubmoduleStuff", () => {
		const subModuleStuff = doSubmoduleStuff()
		expect(subModuleStuff).toBe("Do submodule stuff submodule dependency common dependency")
	})
})

endTest()
