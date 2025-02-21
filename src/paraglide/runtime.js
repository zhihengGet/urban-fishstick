// eslint-disable

import "@inlang/paraglide-js/urlpattern-polyfill";

/**
 * The project's base locale.
 *
 * @example
 *   if (locale === baseLocale) {
 *     // do something
 *   }
 */
export const baseLocale = "en";
/**
 * The project's locales that have been specified in the settings.
 *
 * @example
 *   if (locales.includes(userSelectedLocale) === false) {
 *     throw new Error('Locale is not available');
 *   }
 */
export const locales = /** @type {const} */ (["en", "de"]);
/** @type {string} */
export const cookieName = "PARAGLIDE_LOCALE";
/**
 * @type {Array<"cookie" | "baseLocale" | "globalVariable" | "url">}
 */
export const strategy = ["url", "cookie", "globalVariable", "baseLocale"]
/**
 * The used URL patterns.
 *
 * @type {Array<{ pattern: string, deLocalizedNamedGroups: Record<string, string | null>, localizedNamedGroups: Record<string, Record<string, string | null>> }>}
 */
export const urlPatterns = [
  {
    "pattern": ":protocol://:domain(.*)::port?/:locale(de)?/:path(.*)?",
    "deLocalizedNamedGroups": {
      "locale": null
    },
    "localizedNamedGroups": {
      "en": {
        "locale": null
      },
      "de": {
        "locale": "de"
      }
    }
  }
];
const TREE_SHAKE_COOKIE_STRATEGY_USED = true;
const TREE_SHAKE_URL_STRATEGY_USED = true;
const TREE_SHAKE_GLOBAL_VARIABLE_STRATEGY_USED = true;

/**
 * This is a fallback to get started with a custom
 * strategy and avoid type errors.
 *
 * The implementation is overwritten
 * by \`overwriteGetLocale()\` and \`defineSetLocale()\`.
 *
 * @type {Locale|undefined}
 */
let _locale;
/**
 * Get the current locale.
 *
 * @example
 *   if (getLocale() === 'de') {
 *     console.log('Germany 🇩🇪');
 *   } else if (getLocale() === 'nl') {
 *     console.log('Netherlands 🇳🇱');
 *   }
 *
 * @type {() => Locale}
 */
export let getLocale = () => {
    /** @type {string | undefined} */
    let locale;
    // if running in a server-side rendering context
    // retrieve the locale from the async local storage
    if (serverMiddlewareAsyncStorage) {
        const locale = serverMiddlewareAsyncStorage?.getStore()?.locale;
        if (locale) {
            return locale;
        }
    }
    for (const strat of strategy) {
        if (TREE_SHAKE_COOKIE_STRATEGY_USED && strat === "cookie") {
            locale = extractLocaleFromCookie();
        }
        else if (strat === "baseLocale") {
            locale = baseLocale;
        }
        else if (TREE_SHAKE_URL_STRATEGY_USED &&
            strat === "url" &&
            typeof window !== "undefined") {
            locale = extractLocaleFromUrl(window.location.href);
        }
        else if (TREE_SHAKE_GLOBAL_VARIABLE_STRATEGY_USED &&
            strat === "globalVariable" &&
            _locale !== undefined) {
            locale = _locale;
        }
        // check if match, else continue loop
        if (locale !== undefined) {
            return assertIsLocale(locale);
        }
    }
    throw new Error("No locale found. Read the docs https://inlang.com/m/gerre34r/library-inlang-paraglideJs/errors#no-locale-found");
};
/**
 * Overwrite the \`getLocale()\` function.
 *
 * Use this function to overwrite how the locale is resolved. For example,
 * you can resolve the locale from the browser's preferred language,
 * a cookie, env variable, or a user's preference.
 *
 * @example
 *   overwriteGetLocale(() => {
 *     // resolve the locale from a cookie. fallback to the base locale.
 *     return Cookies.get('locale') ?? baseLocale
 *   }
 *
 * @type {(fn: () => Locale) => void}
 */
export const overwriteGetLocale = (fn) => {
    getLocale = fn;
}; 

/**
 * Set the locale.
 *
 * @example
 *   setLocale('en');
 *
 * @type {(newLocale: Locale) => void}
 */
export let setLocale = (newLocale) => {
    let localeHasBeenSet = false;
    for (const strat of strategy) {
        if (TREE_SHAKE_GLOBAL_VARIABLE_STRATEGY_USED &&
            strat === "globalVariable") {
            // a default for a custom strategy to get started quickly
            // is likely overwritten by `defineSetLocale()`
            _locale = newLocale;
            localeHasBeenSet = true;
        }
        else if (TREE_SHAKE_COOKIE_STRATEGY_USED && strat === "cookie") {
            if (typeof document === "undefined" || !document.cookie) {
                continue;
            }
            // set the cookie
            document.cookie = `${cookieName}=${newLocale}`;
            localeHasBeenSet = true;
        }
        else if (strat === "baseLocale") {
            // nothing to be set here. baseLocale is only a fallback
            continue;
        }
        else if (TREE_SHAKE_URL_STRATEGY_USED &&
            strat === "url" &&
            typeof window !== "undefined") {
            // route to the new url
            //
            // this triggers a page reload but a user rarely
            // switches locales, so this should be fine.
            //
            // if the behavior is not desired, the implementation
            // can be overwritten by `defineSetLocale()` to avoid
            // a full page reload.
            window.location.href = localizeUrl(window.location.href, {
                locale: newLocale,
            }).href;
            // just in case return. the browser reloads the page by setting href
            return;
        }
    }
    if (localeHasBeenSet === false) {
        throw new Error("No strategy was able to set the locale. This can happen if you use browser-based strategies like `cookie` in a server-side rendering environment. Overwrite setLocale() on the server to avoid this error.");
    }
    else if (typeof window !== "undefined" && window.location) {
        // reload the page to reflect the new locale
        window.location.reload();
    }
    return;
};
/**
 * Overwrite the \`setLocale()\` function.
 *
 * Use this function to overwrite how the locale is set. For example,
 * modify a cookie, env variable, or a user's preference.
 *
 * @example
 *   overwriteSetLocale((newLocale) => {
 *     // set the locale in a cookie
 *     return Cookies.set('locale', newLocale)
 *   });
 *
 * @param {(newLocale: Locale) => void} fn
 */
export const overwriteSetLocale = (fn) => {
    setLocale = fn;
};

/**
 * The origin of the current URL.
 *
 * Defaults to "http://y.com" in non-browser environments. If this
 * behavior is not desired, the implementation can be overwritten
 * by `overwriteGetUrlOrigin()`.
 *
 * @type {() => string}
 */
export let getUrlOrigin = () => {
    if (serverMiddlewareAsyncStorage) {
        return (serverMiddlewareAsyncStorage.getStore()?.origin ?? "http://fallback.com");
    }
    else if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return "http://fallback.com";
};
/**
 * Overwrite the getUrlOrigin function.
 *
 * Use this function in server environments to
 * define how the URL origin is resolved.
 *
 * @type {(fn: () => string) => void}
 */
export let overwriteGetUrlOrigin = (fn) => {
    getUrlOrigin = fn;
};

/**
 * Check if something is an available locale.
 *
 * @example
 *   if (isLocale(params.locale)) {
 *     setLocale(params.locale);
 *   } else {
 *     setLocale('en');
 *   }
 *
 * @param {any} locale
 * @returns {locale is Locale}
 */
export function isLocale(locale) {
    return !locale ? false : locales.includes(locale);
}

/**
 * Asserts that the input is a locale.
 *
 * @param {any} input - The input to check.
 * @returns {Locale} The input if it is a locale.
 * @throws {Error} If the input is not a locale.
 */
export function assertIsLocale(input) {
    if (isLocale(input) === false) {
        throw new Error(`Invalid locale: ${input}. Expected one of: ${locales.join(", ")}`);
    }
    return input;
}

/**
 * Extracts a locale from a request.
 *
 * Use the function on the server to extract the locale
 * from a request.
 *
 * The function goes through the strategies in the order
 * they are defined.
 *
 * @example
 *   const locale = extractLocaleFromRequest(request);
 *
 * @type {(request: Request) => Locale}
 */
export const extractLocaleFromRequest = (request) => {
    /** @type {string|undefined} */
    let locale;
    for (const strat of strategy) {
        if (strat === "cookie") {
            locale = request.headers
                .get("cookie")
                ?.split("; ")
                .find((c) => c.startsWith(cookieName + "="))
                ?.split("=")[1];
        }
        else if (TREE_SHAKE_URL_STRATEGY_USED && strat === "url") {
            locale = extractLocaleFromUrl(request.url);
        }
        else if (strat === "globalVariable") {
            locale = _locale;
        }
        else if (strat === "baseLocale") {
            return baseLocale;
        }
        else {
            throw new Error(`Unsupported strategy: ${strat}`);
        }
        if (locale !== undefined) {
            return assertIsLocale(locale);
        }
    }
    throw new Error("No locale found. There is an error in your strategy. Try adding 'baseLocale' as the very last strategy.");
};

/**
 * Extracts a cookie from the document.
 *
 * Will return undefined if the docuement is not available or if the cookie is not set.
 * The `document` object is not available in server-side rendering, so this function should not be called in that context.
 *
 * @returns {string | undefined}
 */
export function extractLocaleFromCookie() {
    if (typeof document === "undefined" || !document.cookie) {
        return;
    }
    const match = document.cookie.match(new RegExp(`(^| )${cookieName}=([^;]+)`));
    const locale = match?.[2];
    if (isLocale(locale)) {
        return locale;
    }
    return undefined;
}

/**
 * Extracts the locale from a given URL using native URLPattern.
 *
 * @param {string} url - The full URL from which to extract the locale.
 * @returns {Locale|undefined} The extracted locale, or undefined if no locale is found.
 */
export function extractLocaleFromUrl(url) {
    for (const element of urlPatterns) {
        const pattern = new URLPattern(element.pattern);
        const match = pattern.exec(url);
        if (match) {
            const groups = aggregateGroups(match);
            for (const [locale, overrideParams] of Object.entries(element.localizedNamedGroups)) {
                let allMatch = true;
                for (const [key, val] of Object.entries(overrideParams)) {
                    const matchedValue = groups[key];
                    // Handle nullable parameters
                    if (val === null) {
                        if (matchedValue != null) {
                            allMatch = false;
                            break;
                        }
                    }
                    // Handle wildcard arrays
                    else if (Array.isArray(val)) {
                        const matchedArray = matchedValue?.split("/") ?? [];
                        if (JSON.stringify(matchedArray) !== JSON.stringify(val)) {
                            allMatch = false;
                            break;
                        }
                    }
                    // Handle regular parameters
                    else if (matchedValue !== val) {
                        allMatch = false;
                        break;
                    }
                }
                if (allMatch) {
                    return assertIsLocale(locale);
                }
            }
        }
    }
    return undefined;
}

/**
 * Localizes a URL to a specific locale using the new namedGroups API.
 * @param {string | URL} url - The URL to localize.
 * @param {Object} options - Options containing the target locale.
 * @param {string} options.locale - The target locale.
 * @returns {URL} - The localized URL.
 */
export function localizeUrl(url, options) {
    const urlObj = new URL(url);
    for (const element of urlPatterns) {
        const pattern = new URLPattern(element.pattern);
        const match = pattern.exec(urlObj.href);
        if (match) {
            /** @type {Record<string, string | null >} */
            const overrides = {};
            for (const [groupName, value] of Object.entries(element.localizedNamedGroups?.[options.locale] ?? {})) {
                overrides[groupName] = value;
            }
            const groups = {
                ...aggregateGroups(match),
                ...overrides,
            };
            return fillPattern(element.pattern, groups);
        }
    }
    throw new Error(`No match found for ${url}`);
}
/**
 * De-localizes a URL.
 *
 * @type {(url: string | URL) => URL}
 */
export function deLocalizeUrl(url) {
    const urlObj = new URL(url);
    for (const element of urlPatterns) {
        const pattern = new URLPattern(element.pattern);
        const match = pattern.exec(urlObj.href);
        if (match) {
            /** @type {Record<string, string | null>} */
            const overrides = {};
            for (const [groupName, value] of Object.entries(element.deLocalizedNamedGroups)) {
                overrides[groupName] = value;
            }
            const groups = {
                ...aggregateGroups(match),
                ...overrides,
            };
            return fillPattern(element.pattern, groups);
        }
    }
    throw new Error(`No match found for ${url}`);
}
/**
 * Fills a URL pattern with values for named groups, supporting all URLPattern-style modifiers:
 *
 * This function will eventually be replaced by https://github.com/whatwg/urlpattern/issues/73
 *
 * Matches:
 * - :name        -> Simple
 * - :name?       -> Optional
 * - :name+       -> One or more
 * - :name*       -> Zero or more
 * - :name(...)   -> Regex group
 *
 * If the value is `null`, the segment is removed.
 *
 * @param {string} pattern - The URL pattern containing named groups.
 * @param {Record<string, string | null | undefined>} values - Object of values for named groups.
 * @returns {URL} - The constructed URL with named groups filled.
 */
function fillPattern(pattern, values) {
    const filled = pattern.replace(/(\/?):([a-zA-Z0-9_]+)(\([^)]*\))?([?+*]?)/g, (_, slash, name, __, modifier) => {
        const value = values[name];
        if (value === null) {
            // If value is null, remove the entire segment including the preceding slash
            return "";
        }
        if (modifier === "?") {
            // Optional segment
            return value !== undefined ? `${slash}${value}` : "";
        }
        if (modifier === "+" || modifier === "*") {
            // Repeatable segments
            if (value === undefined && modifier === "+") {
                throw new Error(`Missing value for "${name}" (one or more required)`);
            }
            return value ? `${slash}${value}` : "";
        }
        // Simple named group (no modifier)
        if (value === undefined) {
            throw new Error(`Missing value for "${name}"`);
        }
        return `${slash}${value}`;
    });
    return new URL(filled);
}
/**
 * Aggregates named groups from various parts of the URLPattern match result.
 *
 *
 * @type {(match: URLPatternResult) => Record<string, string | null | undefined>}
 */
export function aggregateGroups(match) {
    return {
        ...match.hash.groups,
        ...match.hostname.groups,
        ...match.password.groups,
        ...match.pathname.groups,
        ...match.port.groups,
        ...match.protocol.groups,
        ...match.search.groups,
        ...match.username.groups,
    };
}

/**
 * Localizes an href.
 *
 * In contrast to `localizeUrl()`, this function automatically
 * calls `getLocale()` to determine the target locale and
 * returns a relative path if appropriate.
 *
 * @example
 *   localizeHref("/about")
 *   // => "/de/about"
 *
 *   // requires full URL and locale
 *   localizeUrl("http://example.com/about", { locale: "de" })
 *   // => "http://example.com/de/about"
 *
 * @param {string} href
 * @param {Object} [options] - Options
 * @param {string} [options.locale] - The target locale.
 */
export function localizeHref(href, options) {
    const locale = options?.locale ?? getLocale();
    const url = new URL(href, getUrlOrigin());
    const localized = localizeUrl(url, { locale });
    // if the origin is identical and the href is relative,
    // return the relative path
    if (href.startsWith("/") && url.origin === localized.origin) {
        // check for cross origin localization in which case an absolute URL must be returned.
        if (locale !== getLocale()) {
            const localizedCurrentLocale = localizeUrl(url, { locale: getLocale() });
            if (localizedCurrentLocale.origin !== localized.origin) {
                return localized.href;
            }
        }
        return localized.pathname + localized.search + localized.hash;
    }
    return localized.href;
}
/**
 * De-localizes an href.
 *
 * In contrast to `deLocalizeUrl()`, this function automatically
 * calls `getLocale()` to determine the base locale and
 * returns a relative path if appropriate.
 *
 * @example
 *   deLocalizeHref("/de/about")
 *   // => "/about"
 *
 *   // requires full URL and locale
 *   deLocalizeUrl("http://example.com/de/about")
 *   // => "http://example.com/about"
 *
 * @param {string} href
 * @returns {string} - The de-localized href.
 */
export function deLocalizeHref(href) {
    const url = new URL(href, getUrlOrigin());
    const deLocalized = deLocalizeUrl(url);
    // If the origin is identical and the href is relative,
    // return the relative path instead of the full URL.
    if (href.startsWith("/") && url.origin === deLocalized.origin) {
        return deLocalized.pathname + deLocalized.search + deLocalized.hash;
    }
    return deLocalized.href;
}
/**
 * @deprecated use `localizeHref` instead and give feedback on here https://github.com/opral/inlang-paraglide-js/issues/380
 * @type {(href: string, options?: { locale?: string }) => string}
 */
export function localizePath(href, options) {
    return localizeHref(href, options);
}
/**
 * @deprecated use `deLocalizeHref` instead and give feedback on here https://github.com/opral/inlang-paraglide-js/issues/380
 * @type {(href: string) => string}
 */
export function deLocalizePath(href) {
    return deLocalizeHref(href);
}

/**
 * Server side async local storage that is set by `serverMiddleware()`.
 *
 * The variable is used to retrieve the locale and origin in a server-side
 * rendering context without effecting other requests.
 *
 * Is `undefined` on the client.
 *
 * @type {import("async_hooks").AsyncLocalStorage<{ locale: Locale, origin: string }> | undefined}
 */
let serverMiddlewareAsyncStorage = undefined;
/**
 * The handle function defines the locale for the incoming request.
 *
 * @template T
 * @param {Request} request - The incoming request object.
 * @param {(args: { request: Request, locale: Locale }) => T | Promise<T>} resolve - A function that resolves the request.
 * @returns {Promise<any>} The result of `resolve()` within the async storage context.
 */
export async function serverMiddleware(request, resolve) {
    if (!serverMiddlewareAsyncStorage) {
        const { AsyncLocalStorage } = await import("async_hooks");
        serverMiddlewareAsyncStorage = new AsyncLocalStorage();
    }
    const locale = extractLocaleFromRequest(request);
    const origin = new URL(request.url).origin;
    const newRequest = strategy.includes("url")
        ? new Request(deLocalizeUrl(request.url), request)
        : request;
    return serverMiddlewareAsyncStorage.run({ locale, origin }, () => resolve({ locale, request: newRequest }));
}

// ------ TYPES ------

/**
 * A locale that is available in the project.
 *
 * @example
 *   setLocale(request.locale as Locale)
 *
 * @typedef {(typeof locales)[number]} Locale
 */

