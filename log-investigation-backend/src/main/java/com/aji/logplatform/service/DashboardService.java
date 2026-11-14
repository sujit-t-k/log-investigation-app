package com.aji.logplatform.service;

import com.aji.logplatform.dto.dashboard.DashboardSummaryResponse;
import com.aji.logplatform.enums.IncidentStatus;
import com.aji.logplatform.repository.IncidentRepository;
import com.aji.logplatform.repository.LogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final IncidentRepository incidentRepository;
    private final LogRepository logRepository;

    public DashboardService(IncidentRepository incidentRepository, LogRepository logRepository) {
        this.incidentRepository = incidentRepository;
        this.logRepository = logRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        long totalIncidents = incidentRepository.countTotalIncidents();
        long resolvedIncidents = incidentRepository.countByStatus(IncidentStatus.RESOLVED);
        long pendingIncidents = incidentRepository.countByStatusNot(IncidentStatus.RESOLVED);
        long inProgressIncidents = incidentRepository.countByStatus(IncidentStatus.REMEDIATION_IN_PROGRESS);
        long totalLogs = logRepository.countTotalLogs();

        return DashboardSummaryResponse.builder()
                .totalIncidents(totalIncidents)
                .resolvedIncidents(resolvedIncidents)
                .pendingIncidents(pendingIncidents)
                .inProgressIncidents(inProgressIncidents)
                .totalLogs(totalLogs)
                .build();
    }
}

