package com.aji.logplatform.dto.incident;

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
public class UpdateIncidentDetailsRequest {

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    private String remediationPlan;
}

