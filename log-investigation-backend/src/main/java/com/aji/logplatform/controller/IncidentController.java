package com.aji.logplatform.controller;

import com.aji.logplatform.dto.common.PagedResponse;
import com.aji.logplatform.dto.incident.CreateIncidentRequest;
import com.aji.logplatform.dto.incident.IncidentResponse;
import com.aji.logplatform.dto.incident.UpdateIncidentDetailsRequest;
import com.aji.logplatform.dto.incident.UpdateIncidentStatusRequest;
import com.aji.logplatform.enums.IncidentStatus;
import com.aji.logplatform.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public ResponseEntity<IncidentResponse> createIncident(
            @Valid @RequestBody CreateIncidentRequest request) {
        IncidentResponse created = incidentService.createIncident(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<PagedResponse<IncidentResponse>> getIncidents(
            @RequestParam(name = "page", defaultValue = "0") Integer page,
            @RequestParam(name = "size", defaultValue = "50") Integer size,
            @RequestParam(name = "status", required = false) IncidentStatus status,
            @RequestParam(name = "correlationId", required = false) String correlationId
    ) {
        PagedResponse<IncidentResponse> response = incidentService.getIncidents(page, size, status, correlationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> getIncidentById(@PathVariable("id") Long id) {
        IncidentResponse response = incidentService.getIncidentById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentResponse> updateIncidentStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateIncidentStatusRequest request
    ) {
        IncidentResponse updated = incidentService.updateIncidentStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<IncidentResponse> updateIncidentDetails(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateIncidentDetailsRequest request
    ) {
        IncidentResponse updated = incidentService.updateIncidentDetails(id, request);
        return ResponseEntity.ok(updated);
    }
}

