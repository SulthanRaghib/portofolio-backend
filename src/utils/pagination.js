/**
 * Pagination utility untuk membuat response pagination yang konsisten
 * @param {Object} params - Parameter pagination
 * @param {number} params.page - Halaman saat ini
 * @param {number} params.limit - Jumlah item per halaman
 * @param {number} params.totalItems - Total item di database
 * @param {Array} params.data - Data yang akan ditampilkan
 * @param {string} params.baseUrl - Base URL untuk link pagination
 * @returns {Object} Response dengan format pagination
 */
const createPaginationResponse = ({
  page,
  limit,
  totalItems,
  data,
  baseUrl = "",
}) => {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    success: true,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
    links: {
      self: baseUrl ? `${baseUrl}?page=${page}&limit=${limit}` : null,
      first: baseUrl ? `${baseUrl}?page=1&limit=${limit}` : null,
      last: baseUrl ? `${baseUrl}?page=${totalPages}&limit=${limit}` : null,
      next: hasNextPage ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
      prev: hasPrevPage ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
    },
  };
};

/**
 * Validasi dan normalisasi parameter pagination dari query string
 * @param {Object} query - Query parameters dari request
 * @param {number} defaultLimit - Default limit jika tidak disediakan
 * @param {number} maxLimit - Maximum limit yang diizinkan
 * @returns {Object} Object dengan page dan limit yang valid
 */
const getPaginationParams = (query, defaultLimit = 10, maxLimit = 100) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || defaultLimit;

  // Validasi page minimum
  if (page < 1) {
    page = 1;
  }

  // Validasi limit
  if (limit < 1) {
    limit = defaultLimit;
  }

  if (limit > maxLimit) {
    limit = maxLimit;
  }

  return { page, limit };
};

/**
 * Hitung skip untuk Prisma query
 * @param {number} page - Halaman saat ini
 * @param {number} limit - Jumlah item per halaman
 * @returns {number} Jumlah item yang harus di-skip
 */
const calculateSkip = (page, limit) => {
  return (page - 1) * limit;
};

module.exports = {
  createPaginationResponse,
  getPaginationParams,
  calculateSkip,
};
