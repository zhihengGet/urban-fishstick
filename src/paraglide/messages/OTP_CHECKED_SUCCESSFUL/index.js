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
* @param {{}} inputs
* @param {{ locale?: "en" | "de" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const OTP_CHECKED_SUCCESSFUL = (inputs= {}, options = {}) => {
	const locale = options.locale ?? getLocale()
	if (locale === "en") return en.OTP_CHECKED_SUCCESSFUL(inputs)
	if (locale === "de") return de.OTP_CHECKED_SUCCESSFUL(inputs)
	return "OTP_CHECKED_SUCCESSFUL"
}
	
export { OTP_CHECKED_SUCCESSFUL }