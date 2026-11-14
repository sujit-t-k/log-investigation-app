import axiosInstance from './axiosInstance';

/**
 * Fetch paginated and filtered logs
 * GET /logs
 * @param {Object} params - { page, size, correlationId, level, source, from, to }
 */
export const getLogs = async (params = {}) => {
  const response = await axiosInstance.get('/logs', { params });
  return response.data;
};

/**
 * Fetch complete log record by ID (including full raw JSON payload)
 * GET /logs/{id}
 * @param {number|string} id
 */
export const getLogById = async (id) => {
  const response = await axiosInstance.get(`/logs/${id}`);
  return response.data;
};

