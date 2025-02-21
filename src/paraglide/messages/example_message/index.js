// eslint-disable
import * as en from "./en.js"
import * as de from "./de.js"
import { getLocale } from '../../runtime.js'

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ username: NonNullable<unknown> }} inputs
* @param {{ locale?: "en" | "de" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const example_message = (inputs, options = {}) => {
	const locale = options.locale ?? getLocale()
	if (locale === "en") return en.example_message(inputs)
	if (locale === "de") return de.example_message(inputs)
	return "example_message"
}
	
export { example_message }