package com.aji.logplatform.controller;

import com.aji.logplatform.dto.common.PagedResponse;
import com.aji.logplatform.dto.log.LogDetailResponse;
import com.aji.logplatform.dto.log.LogSummaryResponse;
import com.aji.logplatform.service.LogService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<LogSummaryResponse>> getLogs(
            @RequestParam(name = "page", defaultValue = "0") Integer page,
            @RequestParam(name = "size", defaultValue = "50") Integer size,
            @RequestParam(name = "correlationId", required = false) String correlationId,
            @RequestParam(name = "level", required = false) String level,
            @RequestParam(name = "source", required = false) String source,
            @RequestParam(name = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(name = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        PagedResponse<LogSummaryResponse> response = logService.getLogs(
                page, size, correlationId, level, source, from, to
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LogDetailResponse> getLogById(@PathVariable("id") Long id) {
        LogDetailResponse response = logService.getLogById(id);
        return ResponseEntity.ok(response);
    }
}

