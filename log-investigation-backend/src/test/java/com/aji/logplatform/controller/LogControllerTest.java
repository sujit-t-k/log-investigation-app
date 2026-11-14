package com.aji.logplatform.controller;

import com.aji.logplatform.dto.common.PagedResponse;
import com.aji.logplatform.dto.log.LogDetailResponse;
import com.aji.logplatform.dto.log.LogSummaryResponse;
import com.aji.logplatform.exception.GlobalExceptionHandler;
import com.aji.logplatform.exception.InvalidRequestException;
import com.aji.logplatform.exception.ResourceNotFoundException;
import com.aji.logplatform.service.LogService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LogController.class)
@Import(GlobalExceptionHandler.class)
class LogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LogService logService;

    @Test
    @DisplayName("GET /api/logs returns paginated list of logs with HTTP 200")
    void testGetLogsEndpoint() throws Exception {
        LogSummaryResponse summary = LogSummaryResponse.builder()
                .id(1001L)
                .eventTimestamp(LocalDateTime.of(2026, 11, 13, 10, 30, 0))
                .correlationId("abc-123")
                .serviceName("orders-service")
                .logSource("orders.app")
                .logLevel("ERROR")
                .message("Unable to process order")
                .httpStatus(500)
                .requestTime(new BigDecimal("1.234500"))
                .build();

        PagedResponse<LogSummaryResponse> pagedResponse = PagedResponse.<LogSummaryResponse>builder()
                .content(List.of(summary))
                .page(0)
                .size(50)
                .totalElements(1)
                .totalPages(1)
                .last(true)
                .build();

        when(logService.getLogs(eq(0), eq(50), eq("abc-123"), eq("ERROR"), eq("orders.app"), any(), any()))
                .thenReturn(pagedResponse);

        mockMvc.perform(get("/api/logs")
                        .param("page", "0")
                        .param("size", "50")
                        .param("correlationId", "abc-123")
                        .param("level", "ERROR")
                        .param("source", "orders.app")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1001))
                .andExpect(jsonPath("$.content[0].correlationId").value("abc-123"))
                .andExpect(jsonPath("$.content[0].logLevel").value("ERROR"))
                .andExpect(jsonPath("$.content[0].logSource").value("orders.app"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/logs with invalid date range returns HTTP 400 Bad Request")
    void testGetLogsInvalidDateRange() throws Exception {
        when(logService.getLogs(any(), any(), any(), any(), any(), any(), any()))
                .thenThrow(new InvalidRequestException("Start timestamp 'from' cannot be after end timestamp 'to'"));

        mockMvc.perform(get("/api/logs")
                        .param("from", "2026-11-13T12:00:00")
                        .param("to", "2026-11-13T10:00:00")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Start timestamp 'from' cannot be after end timestamp 'to'"))
                .andExpect(jsonPath("$.path").value("/api/logs"));
    }

    @Test
    @DisplayName("GET /api/logs/{id} returns full log details with HTTP 200")
    void testGetLogByIdSuccess() throws Exception {
        LogDetailResponse detail = LogDetailResponse.builder()
                .id(1001L)
                .eventTimestamp(LocalDateTime.of(2026, 11, 13, 10, 30, 0))
                .correlationId("abc-123")
                .logSource("orders.app")
                .logLevel("ERROR")
                .rawLog("{\"event\": \"order_error\"}")
                .build();

        when(logService.getLogById(1001L)).thenReturn(detail);

        mockMvc.perform(get("/api/logs/1001")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1001))
                .andExpect(jsonPath("$.correlationId").value("abc-123"))
                .andExpect(jsonPath("$.rawLog").value("{\"event\": \"order_error\"}"));
    }

    @Test
    @DisplayName("GET /api/logs/{id} for non-existent ID returns HTTP 404 Not Found")
    void testGetLogByIdNotFound() throws Exception {
        when(logService.getLogById(9999L))
                .thenThrow(new ResourceNotFoundException("Log record not found with id: 9999"));

        mockMvc.perform(get("/api/logs/9999")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Log record not found with id: 9999"))
                .andExpect(jsonPath("$.path").value("/api/logs/9999"));
    }
}

