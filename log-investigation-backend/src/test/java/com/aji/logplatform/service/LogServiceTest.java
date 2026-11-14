package com.aji.logplatform.service;

import com.aji.logplatform.dto.common.PagedResponse;
import com.aji.logplatform.dto.log.LogDetailResponse;
import com.aji.logplatform.dto.log.LogSummaryResponse;
import com.aji.logplatform.entity.LogRecord;
import com.aji.logplatform.exception.InvalidRequestException;
import com.aji.logplatform.exception.ResourceNotFoundException;
import com.aji.logplatform.repository.LogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LogServiceTest {

    @Mock
    private LogRepository logRepository;

    @InjectMocks
    private LogService logService;

    private LogRecord sampleRecord;

    @BeforeEach
    void setUp() {
        sampleRecord = new LogRecord();
        sampleRecord.setId(1001L);
        sampleRecord.setEventTimestamp(LocalDateTime.of(2026, 11, 13, 10, 30, 0));
        sampleRecord.setCorrelationId("abc-123");
        sampleRecord.setServiceName("orders-service");
        sampleRecord.setLogSource("orders.app");
        sampleRecord.setLogLevel("ERROR");
        sampleRecord.setMessage("Order failed");
        sampleRecord.setHttpStatus(500);
        sampleRecord.setRequestTime(new BigDecimal("1.234500"));
        sampleRecord.setRawLog("{\"source\": \"orders.app\", \"level\": \"ERROR\"}");
    }

    @Test
    @DisplayName("Verify getLogs returns paginated summary omitting rawLog")
    void testGetLogsSuccess() {
        Page<LogRecord> page = new PageImpl<>(List.of(sampleRecord));
        when(logRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PagedResponse<LogSummaryResponse> response = logService.getLogs(
                0, 50, "abc-123", "ERROR", "orders.app", null, null
        );

        assertThat(response.getContent()).hasSize(1);
        LogSummaryResponse summary = response.getContent().get(0);
        assertThat(summary.getId()).isEqualTo(1001L);
        assertThat(summary.getCorrelationId()).isEqualTo("abc-123");
        assertThat(summary.getLogLevel()).isEqualTo("ERROR");
        assertThat(summary.getLogSource()).isEqualTo("orders.app");
    }

    @Test
    @DisplayName("Verify getLogs rejects invalid date range when from is after to")
    void testGetLogsInvalidDateRange() {
        LocalDateTime from = LocalDateTime.of(2026, 11, 13, 12, 0, 0);
        LocalDateTime to = LocalDateTime.of(2026, 11, 13, 10, 0, 0);

        assertThatThrownBy(() -> logService.getLogs(0, 50, null, null, null, from, to))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("cannot be after end timestamp");
    }

    @Test
    @DisplayName("Verify getLogById returns complete details including rawLog")
    void testGetLogByIdSuccess() {
        when(logRepository.findById(1001L)).thenReturn(Optional.of(sampleRecord));

        LogDetailResponse detail = logService.getLogById(1001L);

        assertThat(detail.getId()).isEqualTo(1001L);
        assertThat(detail.getRawLog()).isEqualTo("{\"source\": \"orders.app\", \"level\": \"ERROR\"}");
        verify(logRepository).findById(1001L);
    }

    @Test
    @DisplayName("Verify getLogById throws ResourceNotFoundException when log does not exist")
    void testGetLogByIdNotFound() {
        when(logRepository.findById(9999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> logService.getLogById(9999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Log record not found with id: 9999");
    }
}

