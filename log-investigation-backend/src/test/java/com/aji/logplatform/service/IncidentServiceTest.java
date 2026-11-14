package com.aji.logplatform.service;

import com.aji.logplatform.dto.incident.CreateIncidentRequest;
import com.aji.logplatform.dto.incident.IncidentResponse;
import com.aji.logplatform.dto.incident.UpdateIncidentDetailsRequest;
import com.aji.logplatform.dto.incident.UpdateIncidentStatusRequest;
import com.aji.logplatform.entity.Incident;
import com.aji.logplatform.enums.IncidentStatus;
import com.aji.logplatform.exception.InvalidStatusTransitionException;
import com.aji.logplatform.exception.ResourceNotFoundException;
import com.aji.logplatform.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @InjectMocks
    private IncidentService incidentService;

    private Incident sampleIncident;

    @BeforeEach
    void setUp() {
        sampleIncident = new Incident();
        sampleIncident.setId(10L);
        sampleIncident.setCorrelationId("corr-123");
        sampleIncident.setTitle("Service Outage");
        sampleIncident.setDescription("High latency in payment gateway");
        sampleIncident.setStatus(IncidentStatus.INCIDENT_IDENTIFIED);
        sampleIncident.setCreatedAt(LocalDateTime.now());
        sampleIncident.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Create incident initializes status to INCIDENT_IDENTIFIED and null resolvedAt")
    void testCreateIncident() {
        CreateIncidentRequest request = CreateIncidentRequest.builder()
                .correlationId("corr-123")
                .title("Service Outage")
                .description("High latency in payment gateway")
                .build();

        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> {
            Incident inc = invocation.getArgument(0);
            inc.setId(10L);
            return inc;
        });

        IncidentResponse response = incidentService.createIncident(request);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getCorrelationId()).isEqualTo("corr-123");
        assertThat(response.getStatus()).isEqualTo(IncidentStatus.INCIDENT_IDENTIFIED);
        assertThat(response.getResolvedAt()).isNull();
        verify(incidentRepository).save(any(Incident.class));
    }

    @Test
    @DisplayName("Valid status transition: INCIDENT_IDENTIFIED -> REMEDIATION_DEFINED")
    void testTransitionToRemediationDefined() {
        when(incidentRepository.findById(10L)).thenReturn(Optional.of(sampleIncident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateIncidentStatusRequest request = UpdateIncidentStatusRequest.builder()
                .status(IncidentStatus.REMEDIATION_DEFINED)
                .build();

        IncidentResponse response = incidentService.updateIncidentStatus(10L, request);

        assertThat(response.getStatus()).isEqualTo(IncidentStatus.REMEDIATION_DEFINED);
        assertThat(response.getResolvedAt()).isNull();
    }

    @Test
    @DisplayName("Valid status transition: REMEDIATION_IN_PROGRESS -> RESOLVED sets resolvedAt")
    void testTransitionToResolved() {
        sampleIncident.setStatus(IncidentStatus.REMEDIATION_IN_PROGRESS);
        when(incidentRepository.findById(10L)).thenReturn(Optional.of(sampleIncident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateIncidentStatusRequest request = UpdateIncidentStatusRequest.builder()
                .status(IncidentStatus.RESOLVED)
                .build();

        IncidentResponse response = incidentService.updateIncidentStatus(10L, request);

        assertThat(response.getStatus()).isEqualTo(IncidentStatus.RESOLVED);
        assertThat(response.getResolvedAt()).isNotNull();
    }

    @Test
    @DisplayName("Invalid status transition: INCIDENT_IDENTIFIED -> RESOLVED is rejected with 400 exception")
    void testInvalidTransitionSkipsSteps() {
        when(incidentRepository.findById(10L)).thenReturn(Optional.of(sampleIncident));

        UpdateIncidentStatusRequest request = UpdateIncidentStatusRequest.builder()
                .status(IncidentStatus.RESOLVED)
                .build();

        assertThatThrownBy(() -> incidentService.updateIncidentStatus(10L, request))
                .isInstanceOf(InvalidStatusTransitionException.class)
                .hasMessageContaining("Invalid status transition from 'INCIDENT_IDENTIFIED' to 'RESOLVED'");
    }

    @Test
    @DisplayName("Invalid status transition: RESOLVED cannot be transitioned back to earlier state")
    void testResolvedCannotTransitionBack() {
        sampleIncident.setStatus(IncidentStatus.RESOLVED);
        sampleIncident.setResolvedAt(LocalDateTime.now());
        when(incidentRepository.findById(10L)).thenReturn(Optional.of(sampleIncident));

        UpdateIncidentStatusRequest request = UpdateIncidentStatusRequest.builder()
                .status(IncidentStatus.REMEDIATION_IN_PROGRESS)
                .build();

        assertThatThrownBy(() -> incidentService.updateIncidentStatus(10L, request))
                .isInstanceOf(InvalidStatusTransitionException.class)
                .hasMessageContaining("Invalid status transition from 'RESOLVED' to 'REMEDIATION_IN_PROGRESS'");
    }

    @Test
    @DisplayName("Update incident details updates metadata without changing status")
    void testUpdateIncidentDetails() {
        when(incidentRepository.findById(10L)).thenReturn(Optional.of(sampleIncident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateIncidentDetailsRequest request = UpdateIncidentDetailsRequest.builder()
                .title("Updated Title")
                .remediationPlan("Restart container instances")
                .build();

        IncidentResponse response = incidentService.updateIncidentDetails(10L, request);

        assertThat(response.getTitle()).isEqualTo("Updated Title");
        assertThat(response.getRemediationPlan()).isEqualTo("Restart container instances");
        assertThat(response.getStatus()).isEqualTo(IncidentStatus.INCIDENT_IDENTIFIED); // Remains unchanged
    }

    @Test
    @DisplayName("Lookup nonexistent incident throws ResourceNotFoundException")
    void testGetNonexistentIncident() {
        when(incidentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> incidentService.getIncidentById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Incident not found with id: 999");
    }
}

