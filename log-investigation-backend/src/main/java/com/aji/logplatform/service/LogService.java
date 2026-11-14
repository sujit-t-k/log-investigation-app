package com.aji.logplatform.service;

import com.aji.logplatform.dto.common.PagedResponse;
import com.aji.logplatform.dto.log.LogDetailResponse;
import com.aji.logplatform.dto.log.LogSummaryResponse;
import com.aji.logplatform.entity.LogRecord;
import com.aji.logplatform.exception.InvalidRequestException;
import com.aji.logplatform.exception.ResourceNotFoundException;
import com.aji.logplatform.repository.LogRepository;
import com.aji.logplatform.repository.specification.LogSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LogService {

    private static final int DEFAULT_PAGE_SIZE = 50;
    private static final int MAX_PAGE_SIZE = 100;

    private final LogRepository logRepository;

    public LogService(LogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<LogSummaryResponse> getLogs(
            Integer page,
            Integer size,
            String correlationId,
            String level,
            String source,
            LocalDateTime from,
            LocalDateTime to
    ) {
        // Validate and sanitize pagination
        int resolvedPage = (page == null || page < 0) ? 0 : page;
        int resolvedSize = (size == null || size <= 0) ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);

        // Validate date boundaries
        if (from != null && to != null && from.isAfter(to)) {
            throw new InvalidRequestException(
                    String.format("Start timestamp 'from' (%s) cannot be after end timestamp 'to' (%s)", from, to)
            );
        }

        // Deterministic sorting: event_timestamp DESC, then id DESC
        Sort sort = Sort.by(
                Sort.Order.desc("eventTimestamp"),
                Sort.Order.desc("id")
        );
        Pageable pageable = PageRequest.of(resolvedPage, resolvedSize, sort);

        Specification<LogRecord> spec = LogSpecification.withFilters(correlationId, level, source, from, to);
        Page<LogRecord> logRecordsPage = logRepository.findAll(spec, pageable);

        Page<LogSummaryResponse> mappedPage = logRecordsPage.map(this::mapToSummary);
        return PagedResponse.fromPage(mappedPage);
    }

    @Transactional(readOnly = true)
    public LogDetailResponse getLogById(Long id) {
        if (id == null) {
            throw new InvalidRequestException("Log ID must not be null");
        }

        LogRecord record = logRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Log record not found with id: " + id));

        return mapToDetail(record);
    }

    private LogSummaryResponse mapToSummary(LogRecord record) {
        return LogSummaryResponse.builder()
                .id(record.getId())
                .eventTimestamp(record.getEventTimestamp())
                .correlationId(record.getCorrelationId())
                .serviceName(record.getServiceName())
                .logSource(record.getLogSource())
                .logLevel(record.getLogLevel())
                .message(record.getMessage())
                .loggerName(record.getLoggerName())
                .threadName(record.getThreadName())
                .operation(record.getOperation())
                .httpMethod(record.getHttpMethod())
                .requestUri(record.getRequestUri())
                .httpStatus(record.getHttpStatus())
                .requestTime(record.getRequestTime())
                .upstreamResponseTime(record.getUpstreamResponseTime())
                .clientIp(record.getClientIp())
                .userAgent(record.getUserAgent())
                .build();
    }

    private LogDetailResponse mapToDetail(LogRecord record) {
        return LogDetailResponse.builder()
                .id(record.getId())
                .eventTimestamp(record.getEventTimestamp())
                .correlationId(record.getCorrelationId())
                .serviceName(record.getServiceName())
                .logSource(record.getLogSource())
                .logLevel(record.getLogLevel())
                .message(record.getMessage())
                .loggerName(record.getLoggerName())
                .threadName(record.getThreadName())
                .operation(record.getOperation())
                .httpMethod(record.getHttpMethod())
                .requestUri(record.getRequestUri())
                .httpStatus(record.getHttpStatus())
                .requestTime(record.getRequestTime())
                .upstreamResponseTime(record.getUpstreamResponseTime())
                .clientIp(record.getClientIp())
                .userAgent(record.getUserAgent())
                .rawLog(record.getRawLog())
                .build();
    }
}

