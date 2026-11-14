package com.aji.logplatform.service;

import com.aji.logplatform.dto.dashboard.DashboardSummaryResponse;
import com.aji.logplatform.enums.IncidentStatus;
import com.aji.logplatform.repository.IncidentRepository;
import com.aji.logplatform.repository.LogRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private LogRepository logRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    @DisplayName("Verify getDashboardSummary aggregates counts accurately")
    void testGetDashboardSummary() {
        // Arrange
        when(incidentRepository.countTotalIncidents()).thenReturn(120L);
        when(incidentRepository.countByStatus(IncidentStatus.RESOLVED)).thenReturn(80L);
        when(incidentRepository.countByStatusNot(IncidentStatus.RESOLVED)).thenReturn(40L);
        when(incidentRepository.countByStatus(IncidentStatus.REMEDIATION_IN_PROGRESS)).thenReturn(15L);
        when(logRepository.countTotalLogs()).thenReturn(150000L);

        // Act
        DashboardSummaryResponse response = dashboardService.getDashboardSummary();

        // Assert
        assertThat(response.getTotalIncidents()).isEqualTo(120L);
        assertThat(response.getResolvedIncidents()).isEqualTo(80L);
        assertThat(response.getPendingIncidents()).isEqualTo(40L);
        assertThat(response.getInProgressIncidents()).isEqualTo(15L);
        assertThat(response.getTotalLogs()).isEqualTo(150000L);

        verify(incidentRepository).countTotalIncidents();
        verify(incidentRepository).countByStatus(IncidentStatus.RESOLVED);
        verify(incidentRepository).countByStatusNot(IncidentStatus.RESOLVED);
        verify(incidentRepository).countByStatus(IncidentStatus.REMEDIATION_IN_PROGRESS);
        verify(logRepository).countTotalLogs();
    }
}

