package com.aji.logplatform.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private long totalIncidents;
    private long resolvedIncidents;
    private long pendingIncidents;
    private long totalLogs;
    private long inProgressIncidents;
}

