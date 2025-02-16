/**
 * An array of routes that are public and do not require authentication.
 * @type {string[]}
 */
export const publicRoutes: string[] = ["/", "/auth/new-verification"];

/**
 * An array of auth routes that are public and do not require authentication.
 * @type {string[]}
 */
export const authRoutes: string[] = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/forgot-password",
  "/auth/new-password",
];

/**
 * Prefix for api authentication Routes.
 * @type {string}
 */
export const apiAuthPrefix: string = "/api/auth";

/**
 * Default redirect path after login.
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT: string = "/settings";
