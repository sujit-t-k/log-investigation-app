import axiosInstance from './axiosInstance';

/**
 * Create a new incident
 * POST /incidents
 * Body: { correlationId, title, description, remediationPlan }
 * Returns IncidentResponse with initial status INCIDENT_IDENTIFIED
 */
export const createIncident = async (data) => {
  const response = await axiosInstance.post('/incidents', data);
  return response.data;
};

/**
 * Fetch paginated and filtered incidents
 * GET /incidents
 * @param {Object} params - { page, size, status, correlationId }
 */
export const getIncidents = async (params = {}) => {
  const response = await axiosInstance.get('/incidents', { params });
  return response.data;
};

/**
 * Fetch incident details by ID
 * GET /incidents/{id}
 * @param {number|string} id
 */
export const getIncidentById = async (id) => {
  const response = await axiosInstance.get(`/incidents/${id}`);
  return response.data;
};

/**
 * Advance incident status through strictly validated lifecycle:
 * INCIDENT_IDENTIFIED -> REMEDIATION_DEFINED -> REMEDIATION_IN_PROGRESS -> RESOLVED
 * PATCH /incidents/{id}/status
 * Body: { status }
 */
export const updateIncidentStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/incidents/${id}/status`, { status });
  return response.data;
};

/**
 * Update incident metadata
 * PATCH /incidents/{id}
 * Body: { title, description, remediationPlan }
 */
export const updateIncident = async (id, data) => {
  const response = await axiosInstance.patch(`/incidents/${id}`, data);
  return response.data;
};

