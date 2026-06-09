/**
 * NoSQL Injection & XSS Sanitization Middleware
 *
 * ⚠️ Express 5 COMPATIBLE — Does NOT use express-mongo-sanitize
 * because Express 5 makes req.query read-only (getter only),
 * which causes: "Cannot set property query of #<IncomingMessage> which has only a getter"
 *
 * Instead, we write our own sanitizer that:
 *   - Sanitizes req.body (writable)
 *   - Checks req.query / req.params but only LOGS warnings (they're validated by express-validator)
 *   - Uses express-validator for strict validation on all query/param values
 */

/**
 * Recursively remove MongoDB operators ($gt, $ne, $where, etc.)
 * from any object. Replaces $ with _ in keys.
 */
const removeMongoOperators = (obj, depth = 0) => {
  if (!obj || typeof obj !== "object" || depth > 10) return obj; // depth limit prevents infinite recursion

  for (const key in obj) {
    // If the key starts with $, it's a MongoDB operator — remove/replace it
    if (key.startsWith("$")) {
      const sanitizedKey = "_" + key.slice(1); // Replace $gt with _gt
      obj[sanitizedKey] = obj[key];
      delete obj[key];
      console.warn(`[SANITIZE] NoSQL operator removed: "${key}" → "${sanitizedKey}"`);
    }

    // Recurse into nested objects and arrays
    if (typeof obj[key] === "object" && obj[key] !== null) {
      removeMongoOperators(obj[key], depth + 1);
    }
  }

  return obj;
};

/**
 * NoSQL Injection Sanitization Middleware (Express 5 Compatible)
 *
 * Sanitizes req.body by removing MongoDB operators like $gt, $ne, $where.
 * For req.query and req.params, we only check and warn because Express 5
 * makes them read-only. express-validator handles strict validation of these.
 */
export const noSqlSanitizer = (req, res, next) => {
  // 1. Sanitize req.body (this is writable in Express 5)
  if (req.body && typeof req.body === "object") {
    removeMongoOperators(req.body);
  }

  // 2. Check req.query (read-only in Express 5 — just detect and warn)
  // express-validator already validates all query params with strict rules,
  // so any MongoDB operator injection through query would be caught there.
  if (req.query && typeof req.query === "object") {
    for (const key in req.query) {
      if (key.startsWith("$")) {
        console.warn(`[SANITIZE] Suspicious MongoDB operator in query: "${key}" — blocked by express-validator`);
      }
    }
  }

  // 3. Check req.params (also validated by express-validator with objectIdParamRules)
  if (req.params && typeof req.params === "object") {
    for (const key in req.params) {
      if (req.params[key] && typeof req.params[key] === "string" && req.params[key].startsWith("$")) {
        console.warn(`[SANITIZE] Suspicious MongoDB operator in params: "${key}" — blocked by express-validator`);
      }
    }
  }

  next();
};

/**
 * XSS Protection Middleware
 *
 * Sanitizes string values in req.body to prevent Cross-Site Scripting.
 * Strips out HTML tags and dangerous characters from user input.
 */
export const xssSanitizer = (req, res, next) => {
  const stripHtmlTags = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    for (const key in obj) {
      if (typeof obj[key] === "string") {
        // Strip HTML tags — removes <script>, onerror=, etc.
        obj[key] = obj[key].replace(/<[^>]*>/g, "").trim();
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        stripHtmlTags(obj[key]);
      }
    }
    return obj;
  };

  // Only sanitize body (query and params are handled by express-validator)
  if (req.body) {
    stripHtmlTags(req.body);
  }

  next();
};

/**
 * HTTP Headers Security Middleware
 *
 * Adds additional security headers beyond what Helmet provides.
 */
export const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // XSS Protection for older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
};