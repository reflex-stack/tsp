// Sub-module index file, export elements here
// You can import elements from root

// Always import with the js extension, event in ts files
import { randomFunction } from "../index.js"

export function subRandomFunction () {
	return randomFunction() * 12
}
