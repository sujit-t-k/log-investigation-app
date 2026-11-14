package com.aji.logplatform.dto.incident;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class CreateIncidentRequest {

    @NotBlank(message = "Correlation ID is mandatory")
    @Size(max = 128, message = "Correlation ID must not exceed 128 characters")
    private String correlationId;

    @NotBlank(message = "Title is mandatory")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    private String remediationPlan;
}

