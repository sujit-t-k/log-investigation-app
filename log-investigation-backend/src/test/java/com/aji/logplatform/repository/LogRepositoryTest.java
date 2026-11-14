package com.aji.logplatform.repository;

import com.aji.logplatform.entity.LogRecord;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional(readOnly = true)
class LogRepositoryTest {

    @Autowired
    private LogRepository logRepository;

    @Test
    @DisplayName("Verify LogRepository can count existing records")
    void verifyCountTotalLogs() {
        long count = logRepository.countTotalLogs();
        assertThat(count).isGreaterThanOrEqualTo(0);
    }

    @Test
    @DisplayName("Verify LogRecord entity maps correctly to existing MySQL records")
    void verifyLogRecordMapping() {
        Page<LogRecord> page = logRepository.findAll(PageRequest.of(0, 5));
        assertThat(page).isNotNull();

        if (!page.isEmpty()) {
            LogRecord record = page.getContent().get(0);
            assertThat(record.getId()).isNotNull();
            assertThat(record.getEventTimestamp()).isNotNull();
            assertThat(record.getLogSource()).isNotBlank();
            assertThat(record.getRawLog()).isNotBlank();

            // Verify single retrieval by ID
            Optional<LogRecord> singleRecord = logRepository.findById(record.getId());
            assertThat(singleRecord).isPresent();
            assertThat(singleRecord.get().getId()).isEqualTo(record.getId());
        }
    }
}
