package com.aji.logplatform.controller;

import com.aji.logplatform.dto.dashboard.DashboardSummaryResponse;
import com.aji.logplatform.service.DashboardService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @Test
    @DisplayName("GET /api/dashboard/summary returns 200 OK with expected JSON structure")
    void testGetDashboardSummaryEndpoint() throws Exception {
        DashboardSummaryResponse mockResponse = DashboardSummaryResponse.builder()
                .totalIncidents(120)
                .resolvedIncidents(80)
                .pendingIncidents(40)
                .inProgressIncidents(15)
                .totalLogs(150000)
                .build();

        when(dashboardService.getDashboardSummary()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/dashboard/summary")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalIncidents").value(120))
                .andExpect(jsonPath("$.resolvedIncidents").value(80))
                .andExpect(jsonPath("$.pendingIncidents").value(40))
                .andExpect(jsonPath("$.inProgressIncidents").value(15))
                .andExpect(jsonPath("$.totalLogs").value(150000));
    }
}

