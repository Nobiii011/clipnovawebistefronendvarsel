// Pure utility/formatting helpers.
// No React imports — safe to use anywhere including non-component files.

/**
 * Format a number as USD currency string.
 * formatCurrency(1500) => "$1,500.00"
 */
export const formatCurrency = (amount, currency = "USD") => {
  if (amount == null || isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number with commas.
 * formatNumber(1000000) => "1,000,000"
 */
export const formatNumber = (num) => {
  if (num == null || isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US").format(num);
};

/**
 * Format bytes into human-readable file size.
 * formatFileSize(24500000) => "23.37 MB"
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Format an ISO date string to a readable date.
 * formatDate("2025-01-10T00:00:00Z") => "Jan 10, 2025"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format an ISO date string to date + time.
 * formatDateTime("2025-01-10T14:30:00Z") => "Jan 10, 2025, 2:30 PM"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/**
 * Truncate a string to a max length with ellipsis.
 */
export const truncate = (str, maxLength = 40) => {
  if (!str) return "";
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};
