

let total = 0
let success = 0
let failed = 0

export function startTest () {
	total = 0
	success = 0
	failed = 0
	return () => {
		console.log(`\n${success} / ${total} succeeded with ${failed} error${failed > 1 ? 's' : ''}.`)
		process.exit( failed )
	}
}



export const describe = ( name, fn ) => {
	console.log(`${ name }`)
	fn()
}

export const it = ( name, fn ) => {
	++total
	try {
		fn()
		console.log(` - ${ name }`)
		++success
	} catch ( e ) {
		++failed
		console.log(`❌ ${ name }`)
		console.error( e )
	}
}

export const expect = ( actual ) => ({
	toBe: ( expected ) => {
		if ( actual !== expected )
			throw new Error(`Expected ${ expected } but got ${ actual }`)
	},
	toEqual: ( expected ) => {
		if ( JSON.stringify( actual ) !== JSON.stringify( expected ) )
			throw new Error(`Expected ${ JSON.stringify( expected ) } but got ${ JSON.stringify( actual ) }`)
	},
	toBeTruthy: () => {
		if ( !actual )
			throw new Error(`Expected truthy but got ${ actual }`)
	},
	toBeFalsy: () => {
		if ( actual )
			throw new Error(`Expected falsy but got ${ actual }`)
	},
	toThrow: () => {
		try {
			actual()
			throw new Error( 'Expected function to throw' )
		} catch ( e ) {
			return true
		}
	}
})
