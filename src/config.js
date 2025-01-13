
export let getConfig = (userPackage) => {
	return {
		cwd: process.cwd(),
		// Default config
		runtime: "node",
		src: './src',
		dist: './dist',
		tests: './tests',
		"test-files": ['test.js'],
		tmp: './tmp',
		reports: './reports',
		'generate-json-report': true,
		'generate-svg-report': true,
		// Override with package config
		...((userPackage ?? {})['tsp'] ?? {})
	}
}
