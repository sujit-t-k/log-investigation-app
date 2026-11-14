package com.aji.logplatform.dto.incident;

import com.aji.logplatform.enums.IncidentStatus;
import jakarta.validation.constraints.NotNull;
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
public class UpdateIncidentStatusRequest {

    @NotNull(message = "Status is mandatory")
    private IncidentStatus status;
}

