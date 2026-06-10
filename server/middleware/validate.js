import { body, param, query, validationResult } from "express-validator";
import mongoose from "mongoose";

/**
 * Middleware to check validation results from express-validator chains.
 * If validation fails, returns 400 with the array of errors.
 * If validation passes, calls next().
 */
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/**
 * Custom validator: Check if a value is a valid MongoDB ObjectId
 */
export const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

/* =====================================================
   AUTH VALIDATION RULES
   ===================================================== */

export const registerRules = [
  body("firstName")
    .trim()
    .notEmpty().withMessage("First name is required")
    .isLength({ min: 2, max: 50 }).withMessage("First name must be 2-50 characters"),

  body("lastName")
    .trim()
    .notEmpty().withMessage("Last name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Last name must be 2-50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6, max: 128 }).withMessage("Password must be 6-128 characters"),

  // Use checkFalsy: true so empty strings (""), null, undefined are all treated as "not provided"
  body("location")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage("Location must be at most 100 characters"),

  body("occupation")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage("Occupation must be at most 100 characters"),

  handleValidation,
];

export const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),

  handleValidation,
];

export const googleLoginRules = [
  body("credential")
    .trim()
    .notEmpty().withMessage("Google credential token is required"),

  handleValidation,
];

export const forgotPasswordRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  handleValidation,
];

export const resetPasswordRules = [
  param("token")
    .trim()
    .notEmpty().withMessage("Reset token is required")
    .isHexadecimal().withMessage("Invalid reset token format"),

  body("password")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6, max: 128 }).withMessage("Password must be 6-128 characters"),

  handleValidation,
];

export const changePasswordRules = [
  body("current")
    .notEmpty().withMessage("Current password is required"),

  body("new")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6, max: 128 }).withMessage("New password must be 6-128 characters"),

  handleValidation,
];

/* =====================================================
   EVENT VALIDATION RULES
   ===================================================== */

export const createEventRules = [
  body("title")
    .trim()
    .notEmpty().withMessage("Event title is required")
    .isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Event description is required")
    .isLength({ min: 10, max: 5000 }).withMessage("Description must be 10-5000 characters"),

  body("location")
    .trim()
    .notEmpty().withMessage("Event location is required")
    .isLength({ max: 200 }).withMessage("Location must be at most 200 characters"),

  body("date")
    .notEmpty().withMessage("Event date is required")
    .isISO8601().withMessage("Must be a valid date")
    .custom((value) => {
      const eventDate = new Date(value);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date value");
      }
      return true;
    }),

  body("category")
    .trim()
    .notEmpty().withMessage("Event category is required")
    .isIn([
      "Music", "Tech", "Sports", "Art", "Food", "Business",
      "Education", "Health", "Social", "Travel", "Gaming", "Party", "Other"
    ]).withMessage("Invalid event category"),

  body("price")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 10000 }).withMessage("Price must be between $0 and $10,000")
    .toFloat(),

  body("coordinates")
    .optional({ checkFalsy: true })
    .custom((value) => {
      try {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        if (
          typeof parsed.lat !== "number" ||
          typeof parsed.lng !== "number" ||
          parsed.lat < -90 || parsed.lat > 90 ||
          parsed.lng < -180 || parsed.lng > 180
        ) {
          throw new Error("Invalid coordinates");
        }
        return true;
      } catch (e) {
        throw new Error("Coordinates must be valid JSON with lat (-90 to 90) and lng (-180 to 180)");
      }
    }),

  handleValidation,
];

export const getFeedEventsRules = [
  query("page")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 50 }).withMessage("Limit must be 1-50")
    .toInt(),

  query("search")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage("Search query too long"),

  query("category")
    .optional({ checkFalsy: true })
    .trim(),

  query("sort")
    .optional({ checkFalsy: true })
    .trim()
    .isIn(["Newest", "Oldest"]).withMessage("Sort must be 'Newest' or 'Oldest'"),

  handleValidation,
];

export const objectIdParamRules = (fieldName = "id") => [
  param(fieldName)
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error(`Invalid ${fieldName} format`);
      }
      return true;
    }),
  handleValidation,
];

export const postCommentRules = [
  param("id")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid event ID format");
      return true;
    }),

  body("text")
    .trim()
    .notEmpty().withMessage("Comment text is required")
    .isLength({ min: 1, max: 1000 }).withMessage("Comment must be 1-1000 characters"),

  handleValidation,
];

export const addReviewRules = [
  param("id")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid event ID format");
      return true;
    }),

  body("rating")
    .notEmpty().withMessage("Rating is required")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5")
    .toInt(),

  body("text")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage("Review text must be at most 1000 characters"),

  handleValidation,
];

export const verifyTicketRules = [
  body("eventId")
    .notEmpty().withMessage("Event ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid event ID format");
      return true;
    }),

  body("ticketUserId")
    .notEmpty().withMessage("Ticket user ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid user ID format");
      return true;
    }),

  handleValidation,
];

/* =====================================================
   USER VALIDATION RULES
   ===================================================== */

export const updateUserRules = [
  param("id")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid user ID format");
      return true;
    }),

  body("firstName")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("First name must be 2-50 characters"),

  body("lastName")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Last name must be 2-50 characters"),

  body("location")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage("Location must be at most 100 characters"),

  body("occupation")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage("Occupation must be at most 100 characters"),

  body("twitter")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage("Twitter URL too long"),

  body("linkedin")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage("LinkedIn URL too long"),

  body("instagram")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage("Instagram URL too long"),

  handleValidation,
];

export const toggleFollowRules = [
  param("id")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid user ID format");
      return true;
    }),

  param("targetId")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid target user ID format");
      return true;
    }),

  handleValidation,
];

export const toggleBookmarkRules = [
  param("id")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid user ID format");
      return true;
    }),

  param("eventId")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid event ID format");
      return true;
    }),

  handleValidation,
];

/* =====================================================
   ADMIN VALIDATION RULES
   ===================================================== */

export const createReportRules = [
  body("reporterId")
    .notEmpty().withMessage("Reporter ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid reporter ID format");
      return true;
    }),

  body("reporterName")
    .trim()
    .notEmpty().withMessage("Reporter name is required")
    .isLength({ max: 100 }).withMessage("Reporter name too long"),

  body("targetEventId")
    .notEmpty().withMessage("Target event ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid event ID format");
      return true;
    }),

  body("eventTitle")
    .trim()
    .notEmpty().withMessage("Event title is required")
    .isLength({ max: 200 }).withMessage("Event title too long"),

  body("reason")
    .trim()
    .notEmpty().withMessage("Report reason is required")
    .isLength({ min: 5, max: 1000 }).withMessage("Reason must be 5-1000 characters"),

  handleValidation,
];

export const sendBroadcastRules = [
  body("title")
    .trim()
    .notEmpty().withMessage("Broadcast title is required")
    .isLength({ max: 200 }).withMessage("Title too long"),

  body("message")
    .trim()
    .notEmpty().withMessage("Broadcast message is required")
    .isLength({ max: 2000 }).withMessage("Message too long"),

  handleValidation,
];

/* =====================================================
   PAYMENT VALIDATION RULES
   ===================================================== */

export const createCheckoutRules = [
  body("eventId")
    .notEmpty().withMessage("Event ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid event ID format");
      return true;
    }),

  body("eventTitle")
    .trim()
    .notEmpty().withMessage("Event title is required")
    .isLength({ max: 200 }).withMessage("Event title too long"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0.5, max: 10000 }).withMessage("Price must be between $0.50 and $10,000")
    .toFloat(),

  body("userId")
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value && !isValidObjectId(value)) throw new Error("Invalid user ID format");
      return true;
    }),

  handleValidation,
];

/* =====================================================
   NOTIFICATION VALIDATION RULES
   ===================================================== */

export const notificationRules = [
  param("userId")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid user ID format");
      return true;
    }),

  handleValidation,
];

/* =====================================================
   MESSAGE VALIDATION RULES
   ===================================================== */

export const getMessagesRules = [
  param("eventId")
    .custom((value) => {
      if (!isValidObjectId(value)) throw new Error("Invalid event ID format");
      return true;
    }),

  handleValidation,
];

/* =====================================================
   AI CHAT VALIDATION RULES
   ===================================================== */

export const chatWithAIRules = [
  body("message")
    .trim()
    .notEmpty().withMessage("Message is required")
    .isLength({ max: 1000 }).withMessage("Message too long (max 1000 characters)"),

  handleValidation,
];