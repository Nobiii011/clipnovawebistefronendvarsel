// App-wide configuration constants.

export const APP_CONFIG = {
  APP_NAME: "NovaX",
  DEFAULT_PAGE_SIZE: 10,
  MAX_VIDEO_UPLOAD_COUNT: 5,
  MIN_WITHDRAWAL_AMOUNT: 10, // USD
  SUPPORTED_VIDEO_FORMATS: ["video/mp4", "video/webm", "video/quicktime"],
  SUPPORTED_PAYMENT_METHODS: ["UPI", "Bank Transfer", "PayPal", "Payoneer"],
};

export const USER_ROLES = {
  CREATOR: "creator",
  ADMIN: "admin",
};

export const WITHDRAWAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PAID: "paid",
};

export const VIDEO_STATUS = {
  PROCESSING: "processing",
  ACTIVE: "active",
  FAILED: "failed",
};
