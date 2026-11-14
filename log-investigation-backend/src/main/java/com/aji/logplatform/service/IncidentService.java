package com.aji.logplatform.service;

import com.aji.logplatform.dto.common.PagedResponse;
import com.aji.logplatform.dto.incident.CreateIncidentRequest;
import com.aji.logplatform.dto.incident.IncidentResponse;
import com.aji.logplatform.dto.incident.UpdateIncidentDetailsRequest;
import com.aji.logplatform.dto.incident.UpdateIncidentStatusRequest;
import com.aji.logplatform.entity.Incident;
import com.aji.logplatform.enums.IncidentStatus;
import com.aji.logplatform.exception.InvalidRequestException;
import com.aji.logplatform.exception.InvalidStatusTransitionException;
import com.aji.logplatform.exception.ResourceNotFoundException;
import com.aji.logplatform.repository.IncidentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class IncidentService {

    private static final int DEFAULT_PAGE_SIZE = 50;
    private static final int MAX_PAGE_SIZE = 100;

    private final IncidentRepository incidentRepository;

    public IncidentService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @Transactional
    public IncidentResponse createIncident(CreateIncidentRequest request) {
        Incident incident = new Incident();
        incident.setCorrelationId(request.getCorrelationId().trim());
        incident.setTitle(request.getTitle().trim());
        incident.setDescription(request.getDescription());
        incident.setRemediationPlan(request.getRemediationPlan());
        // Enforce initial status as INCIDENT_IDENTIFIED; client cannot override
        incident.setStatus(IncidentStatus.INCIDENT_IDENTIFIED);

        LocalDateTime now = LocalDateTime.now();
        incident.setCreatedAt(now);
        incident.setUpdatedAt(now);
        incident.setResolvedAt(null);

        Incident saved = incidentRepository.save(incident);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<IncidentResponse> getIncidents(
            Integer page,
            Integer size,
            IncidentStatus status,
            String correlationId
    ) {
        int resolvedPage = (page == null || page < 0) ? 0 : page;
        int resolvedSize = (size == null || size <= 0) ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);

        String trimmedCorrelationId = (correlationId != null && !correlationId.trim().isEmpty())
                ? correlationId.trim() : null;

        Pageable pageable = PageRequest.of(resolvedPage, resolvedSize, Sort.by(Sort.Order.desc("createdAt")));
        Page<Incident> incidentPage = incidentRepository.findWithFilters(status, trimmedCorrelationId, pageable);

        Page<IncidentResponse> responsePage = incidentPage.map(this::mapToResponse);
        return PagedResponse.fromPage(responsePage);
    }

    @Transactional(readOnly = true)
    public IncidentResponse getIncidentById(Long id) {
        if (id == null) {
            throw new InvalidRequestException("Incident ID must not be null");
        }
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));
        return mapToResponse(incident);
    }

    @Transactional
    public IncidentResponse updateIncidentStatus(Long id, UpdateIncidentStatusRequest request) {
        if (id == null) {
            throw new InvalidRequestException("Incident ID must not be null");
        }
        if (request.getStatus() == null) {
            throw new InvalidRequestException("Target status must not be null");
        }

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));

        // Validate state transition rules
        validateStatusTransition(incident.getStatus(), request.getStatus());

        incident.setStatus(request.getStatus());
        LocalDateTime now = LocalDateTime.now();
        incident.setUpdatedAt(now);

        if (request.getStatus() == IncidentStatus.RESOLVED) {
            incident.setResolvedAt(now);
        }

        Incident saved = incidentRepository.save(incident);
        return mapToResponse(saved);
    }

    @Transactional
    public IncidentResponse updateIncidentDetails(Long id, UpdateIncidentDetailsRequest request) {
        if (id == null) {
            throw new InvalidRequestException("Incident ID must not be null");
        }

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            incident.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            incident.setDescription(request.getDescription());
        }
        if (request.getRemediationPlan() != null) {
            incident.setRemediationPlan(request.getRemediationPlan());
        }

        incident.setUpdatedAt(LocalDateTime.now());
        Incident saved = incidentRepository.save(incident);
        return mapToResponse(saved);
    }

    /**
     * Dedicated state transition validation method enforcing:
     * INCIDENT_IDENTIFIED -> REMEDIATION_DEFINED -> REMEDIATION_IN_PROGRESS -> RESOLVED.
     * Reopening or changing back a resolved incident is strictly prohibited.
     */
    public void validateStatusTransition(IncidentStatus currentStatus, IncidentStatus targetStatus) {
        if (currentStatus == targetStatus) {
            throw new InvalidStatusTransitionException(
                    String.format("Incident is already in status '%s'", currentStatus)
            );
        }

        boolean isValid = switch (currentStatus) {
            case INCIDENT_IDENTIFIED -> targetStatus == IncidentStatus.REMEDIATION_DEFINED;
            case REMEDIATION_DEFINED -> targetStatus == IncidentStatus.REMEDIATION_IN_PROGRESS;
            case REMEDIATION_IN_PROGRESS -> targetStatus == IncidentStatus.RESOLVED;
            case RESOLVED -> false; // Terminal state in initial implementation
        };

        if (!isValid) {
            throw new InvalidStatusTransitionException(
                    String.format("Invalid status transition from '%s' to '%s'", currentStatus, targetStatus)
            );
        }
    }

    private IncidentResponse mapToResponse(Incident incident) {
        return IncidentResponse.builder()
                .id(incident.getId())
                .correlationId(incident.getCorrelationId())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .remediationPlan(incident.getRemediationPlan())
                .status(incident.getStatus())
                .createdAt(incident.getCreatedAt())
                .updatedAt(incident.getUpdatedAt())
                .resolvedAt(incident.getResolvedAt())
                .build();
    }
}

