package com.aji.logplatform.repository;

import com.aji.logplatform.entity.LogRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LogRepository extends JpaRepository<LogRecord, Long>, JpaSpecificationExecutor<LogRecord> {

    /**
     * Efficiently count total log records.
     */
    @Query("SELECT COUNT(l) FROM LogRecord l")
    long countTotalLogs();
}
