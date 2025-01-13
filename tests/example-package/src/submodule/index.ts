import { submoduleDep } from "./submodule-dep.js";
import { commonDep } from "../common-dep.js";


export function doSubmoduleStuff () {
	console.log("Do submodule stuff", submoduleDep, commonDep)
}
