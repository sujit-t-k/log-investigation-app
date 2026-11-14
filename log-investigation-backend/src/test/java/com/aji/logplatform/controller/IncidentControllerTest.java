package com.aji.logplatform.controller;

import com.aji.logplatform.dto.common.PagedResponse;
import com.aji.logplatform.dto.incident.CreateIncidentRequest;
import com.aji.logplatform.dto.incident.IncidentResponse;
import com.aji.logplatform.dto.incident.UpdateIncidentDetailsRequest;
import com.aji.logplatform.dto.incident.UpdateIncidentStatusRequest;
import com.aji.logplatform.enums.IncidentStatus;
import com.aji.logplatform.exception.GlobalExceptionHandler;
import com.aji.logplatform.exception.InvalidStatusTransitionException;
import com.aji.logplatform.exception.ResourceNotFoundException;
import com.aji.logplatform.service.IncidentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(IncidentController.class)
@Import(GlobalExceptionHandler.class)
class IncidentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IncidentService incidentService;

    @Test
    @DisplayName("POST /api/incidents creates incident and returns HTTP 201 Created")
    void testCreateIncidentSuccess() throws Exception {
        CreateIncidentRequest request = CreateIncidentRequest.builder()
                .correlationId("corr-123")
                .title("Order processing failure")
                .description("HTTP 500 internal errors")
                .build();

        IncidentResponse response = IncidentResponse.builder()
                .id(1L)
                .correlationId("corr-123")
                .title("Order processing failure")
                .description("HTTP 500 internal errors")
                .status(IncidentStatus.INCIDENT_IDENTIFIED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(incidentService.createIncident(any(CreateIncidentRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.correlationId").value("corr-123"))
                .andExpect(jsonPath("$.title").value("Order processing failure"))
                .andExpect(jsonPath("$.status").value("INCIDENT_IDENTIFIED"));
    }

    @Test
    @DisplayName("POST /api/incidents with blank correlationId or title returns HTTP 400")
    void testCreateIncidentValidationFailure() throws Exception {
        CreateIncidentRequest invalidRequest = CreateIncidentRequest.builder()
                .correlationId("")
                .title("")
                .build();

        mockMvc.perform(post("/api/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("GET /api/incidents returns paginated incidents with HTTP 200")
    void testGetIncidents() throws Exception {
        IncidentResponse item = IncidentResponse.builder()
                .id(1L)
                .correlationId("corr-123")
                .title("Order issue")
                .status(IncidentStatus.INCIDENT_IDENTIFIED)
                .build();

        PagedResponse<IncidentResponse> page = PagedResponse.<IncidentResponse>builder()
                .content(List.of(item))
                .page(0)
                .size(50)
                .totalElements(1)
                .totalPages(1)
                .last(true)
                .build();

        when(incidentService.getIncidents(eq(0), eq(50), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/incidents")
                        .param("page", "0")
                        .param("size", "50")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].correlationId").value("corr-123"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/incidents/{id} returns incident details with HTTP 200")
    void testGetIncidentByIdSuccess() throws Exception {
        IncidentResponse item = IncidentResponse.builder()
                .id(1L)
                .correlationId("corr-123")
                .title("Order issue")
                .status(IncidentStatus.INCIDENT_IDENTIFIED)
                .build();

        when(incidentService.getIncidentById(1L)).thenReturn(item);

        mockMvc.perform(get("/api/incidents/1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Order issue"));
    }

    @Test
    @DisplayName("GET /api/incidents/{id} for nonexistent incident returns HTTP 404")
    void testGetIncidentByIdNotFound() throws Exception {
        when(incidentService.getIncidentById(999L))
                .thenThrow(new ResourceNotFoundException("Incident not found with id: 999"));

        mockMvc.perform(get("/api/incidents/999")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @DisplayName("PATCH /api/incidents/{id}/status rejects invalid transition with HTTP 400")
    void testUpdateStatusInvalidTransition() throws Exception {
        UpdateIncidentStatusRequest request = UpdateIncidentStatusRequest.builder()
                .status(IncidentStatus.RESOLVED)
                .build();

        when(incidentService.updateIncidentStatus(eq(1L), any(UpdateIncidentStatusRequest.class)))
                .thenThrow(new InvalidStatusTransitionException("Invalid status transition from 'INCIDENT_IDENTIFIED' to 'RESOLVED'"));

        mockMvc.perform(patch("/api/incidents/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Invalid status transition from 'INCIDENT_IDENTIFIED' to 'RESOLVED'"));
    }

    @Test
    @DisplayName("PATCH /api/incidents/{id} updates details with HTTP 200")
    void testUpdateIncidentDetails() throws Exception {
        UpdateIncidentDetailsRequest request = UpdateIncidentDetailsRequest.builder()
                .title("Updated Title")
                .remediationPlan("Scale replicas")
                .build();

        IncidentResponse response = IncidentResponse.builder()
                .id(1L)
                .correlationId("corr-123")
                .title("Updated Title")
                .remediationPlan("Scale replicas")
                .status(IncidentStatus.INCIDENT_IDENTIFIED)
                .build();

        when(incidentService.updateIncidentDetails(eq(1L), any(UpdateIncidentDetailsRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/incidents/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.remediationPlan").value("Scale replicas"));
    }
}

