// If you have no tests, uncomment this
// console.log("No test implemented.")
// process.exit(0)

// Import your code directly from src directory thanks to bun
import { randomFunction } from "../src/index.js"
import { subRandomFunction } from "../src/submodule/index.js"
// Import Bun testing lib
import { describe, test, expect } from "bun:test"

describe("Main module", () => {
	test("Should call random", () => {
		const rootResult = randomFunction()
		expect(rootResult).toBe(5)
	})
})

describe("Sub module", () => {
	test("Should call sub random", () => {
		const subResult = subRandomFunction()
		expect(subResult).toBe(60)
	})
	// Test error example
	// test("Should fail", () => {
	// 	expect(5).toBe(12)
	// })
})
