import { submoduleDep } from "./submodule-dep.js";
import { commonDep } from "../common-dep.js";


export function doSubmoduleStuff () {
	return `Do submodule stuff ${submoduleDep} ${commonDep}`
}
