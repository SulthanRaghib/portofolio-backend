// Validasi email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validasi URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Validasi project data
const validateProject = (data) => {
  const errors = {};

  // Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.title = "Title is required";
  } else if (data.title.length > 200) {
    errors.title = "Title must be less than 200 characters";
  }

  // Description validation
  if (!data.descriptionEn || data.descriptionEn.trim().length === 0) {
    errors.descriptionEn = "English description is required";
  }

  if (!data.descriptionId || data.descriptionId.trim().length === 0) {
    errors.descriptionId = "Indonesian description is required";
  }

  // Technologies validation
  if (
    !data.technologies ||
    !Array.isArray(data.technologies) ||
    data.technologies.length === 0
  ) {
    errors.technologies = "At least one technology is required";
  }

  // URL validation (optional fields)
  if (data.demoUrl && !isValidUrl(data.demoUrl)) {
    errors.demoUrl = "Invalid demo URL format";
  }

  if (data.githubUrl && !isValidUrl(data.githubUrl)) {
    errors.githubUrl = "Invalid GitHub URL format";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validasi login data
const validateLogin = (data) => {
  const errors = {};

  if (!data.email || data.email.trim().length === 0) {
    errors.email = "Email is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.password || data.password.trim().length === 0) {
    errors.password = "Password is required";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Sanitize input (mencegah XSS)
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and >
    .substring(0, 10000); // Limit length
};

// Validasi UUID
const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Validasi certification data
const validateCertification = (data) => {
  const errors = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = "Title is required";
  }

  if (!data.issuer || data.issuer.trim().length === 0) {
    errors.issuer = "Issuer is required";
  }

  if (!data.issuedAt) {
    errors.issuedAt = "Issued date is required";
  } else if (isNaN(new Date(data.issuedAt).getTime())) {
    errors.issuedAt = "Invalid date format";
  }

  if (data.credentialUrl && !isValidUrl(data.credentialUrl)) {
    errors.credentialUrl = "Invalid Credential URL format";
  }

  // credentialId optional but limit length
  if (data.credentialId && typeof data.credentialId === "string" && data.credentialId.length > 200) {
    errors.credentialId = "credentialId must be less than 200 characters";
  }

  // skills should be an array if provided
  if (data.skills !== undefined) {
    if (!Array.isArray(data.skills)) {
      errors.skills = "Skills must be an array of strings";
    } else {
      const invalid = data.skills.some((s) => typeof s !== "string" || s.trim().length === 0);
      if (invalid) errors.skills = "Each skill must be a non-empty string";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  isValidEmail,
  isValidUrl,
  validateProject,
  validateLogin,
  validateCertification,
  sanitizeInput,
  isValidUUID,
};
