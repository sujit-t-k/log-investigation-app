package com.aji.logplatform.repository;

import com.aji.logplatform.entity.Incident;
import com.aji.logplatform.enums.IncidentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    @Query("SELECT COUNT(i) FROM Incident i")
    long countTotalIncidents();

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status = :status")
    long countByStatus(@Param("status") IncidentStatus status);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status <> :status")
    long countByStatusNot(@Param("status") IncidentStatus status);

    @Query("SELECT i FROM Incident i WHERE " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:correlationId IS NULL OR i.correlationId = :correlationId)")
    Page<Incident> findWithFilters(
            @Param("status") IncidentStatus status,
            @Param("correlationId") String correlationId,
            Pageable pageable
    );
}

