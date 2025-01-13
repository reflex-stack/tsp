import { execAsync, newLine, nicePrint, oraTask } from "@zouloux/cli";


export async function test ( config ) {
	nicePrint(`Starting test sequence`)
	newLine()
	for ( const testFile of config["test-files"] ) {
		const command = `${config.runtime} ${config.tests}/${testFile}`
		nicePrint(`{d}$ ${command}`)
		try {
			await execAsync(command, 3)
		}
		catch ( error ) {
			console.error(error)
			nicePrint(`{b/g}Test ${testFile} failed`, { code: error.code })
		}
		newLine()
	}
	await oraTask(`All tests passed`, (t) => {t.success()})
}
