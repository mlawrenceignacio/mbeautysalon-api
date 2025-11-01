import mongoSanitize from "mongo-sanitize";

function sanitizeKeys(obj) {
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    }
  }
}

function deepSanitize(obj, depth = 0, maxDepth = 0) {
  if (!obj && typeof obj !== "object") return;
  if (depth > maxDepth) return;

  sanitizeKeys(obj);

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];

        if (item && typeof item === "object") {
          deepSanitize(item, depth + 1, maxDepth);
        } else {
          value[i] = mongoSanitize(item);
        }
      }
    } else if (value && typeof value === "object") {
      deepSanitize(value, depth + 1, maxDepth);
    } else {
      obj[key] = mongoSanitize(value);
    }
  }
}

export const sanitizeRequest = (req, res, next) => {
  try {
    deepSanitize(req.body);
    deepSanitize(req.params);
    deepSanitize(req.query);

    next();
  } catch (error) {
    console.error("Sanitization error: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};
