package com.aji.logplatform.repository.specification;

import com.aji.logplatform.entity.LogRecord;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class LogSpecification {

    private LogSpecification() {
        // Utility class
    }

    public static Specification<LogRecord> withFilters(
            String correlationId,
            String logLevel,
            String logSource,
            LocalDateTime from,
            LocalDateTime to
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (correlationId != null && !correlationId.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("correlationId"), correlationId.trim()));
            }

            if (logLevel != null && !logLevel.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.upper(root.get("logLevel")),
                        logLevel.trim().toUpperCase()
                ));
            }

            if (logSource != null && !logSource.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("logSource"), logSource.trim()));
            }

            if (from != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("eventTimestamp"), from));
            }

            if (to != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("eventTimestamp"), to));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

