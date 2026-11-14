package com.aji.logplatform.dto.log;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogSummaryResponse {

    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventTimestamp;

    private String correlationId;
    private String serviceName;
    private String logSource;
    private String logLevel;
    private String message;
    private String loggerName;
    private String threadName;
    private String operation;
    private String httpMethod;
    private String requestUri;
    private Integer httpStatus;
    private BigDecimal requestTime;
    private BigDecimal upstreamResponseTime;
    private String clientIp;
    private String userAgent;
}

