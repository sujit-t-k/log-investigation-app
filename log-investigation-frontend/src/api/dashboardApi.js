import axiosInstance from './axiosInstance';

/**
 * Fetch high-level statistics for the dashboard
 * GET /dashboard/summary
 * Returns: { totalIncidents, resolvedIncidents, pendingIncidents, inProgressIncidents, totalLogs }
 */
export const getDashboardSummary = async () => {
  const response = await axiosInstance.get('/dashboard/summary');
  return response.data;
};

