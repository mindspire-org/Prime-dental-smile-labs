// Security middleware for reCAPTCHA validation and other security measures

export async function validateRecaptcha(req, res, next) {
  try {
    const { recaptchaToken } = req.body;

    // Skip reCAPTCHA validation in development or if not configured
    if (process.env.NODE_ENV === "development" || !process.env.RECAPTCHA_SECRET_KEY) {
      return next();
    }

    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA token is required"
      });
    }

    // Verify reCAPTCHA token with Google
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    });

    const result = await response.json();

    if (!result.success) {
      console.error("reCAPTCHA validation failed:", result["error-codes"]);
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA validation failed. Please try again."
      });
    }

    // Check score (for reCAPTCHA v3)
    if (result.score !== undefined && result.score < 0.5) {
      return res.status(400).json({
        success: false,
        message: "Suspicious activity detected. Please try again."
      });
    }

    next();
  } catch (error) {
    console.error("reCAPTCHA validation error:", error);
    // In case of reCAPTCHA service error, allow the request in development
    if (process.env.NODE_ENV === "development") {
      return next();
    }
    
    res.status(500).json({
      success: false,
      message: "Security validation failed"
    });
  }
}

// Rate limiting for form submissions
export function createFormRateLimit(windowMs = 15 * 60 * 1000, max = 5) {
  const submissions = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old submissions
    if (submissions.has(key)) {
      const userSubmissions = submissions.get(key).filter(time => time > windowStart);
      submissions.set(key, userSubmissions);
    }

    const userSubmissions = submissions.get(key) || [];

    if (userSubmissions.length >= max) {
      return res.status(429).json({
        success: false,
        message: "Too many submissions. Please try again later."
      });
    }

    userSubmissions.push(now);
    submissions.set(key, userSubmissions);

    next();
  };
}

// Input sanitization middleware
export function sanitizeInput(req, res, next) {
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    
    // Remove potentially dangerous characters
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === "object") {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
}

// File upload security
export function validateFileUpload(req, res, next) {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/dicom",
    "application/zip",
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File type ${file.mimetype} is not allowed`
        });
      }

      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} is too large. Maximum size is 10MB`
        });
      }
    }
  }

  next();
}

// CORS configuration for API security
export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://primesmilelab.com",
      "https://www.primesmilelab.com",
    ];

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Security headers middleware
export function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  
  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Content Security Policy (basic implementation)
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com;"
  );

  next();
}
