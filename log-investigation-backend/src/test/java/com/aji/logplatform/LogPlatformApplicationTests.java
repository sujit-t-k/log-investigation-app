package com.aji.logplatform;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class LogPlatformApplicationTests {

    @Autowired
    private DataSource dataSource;

    @Test
    @DisplayName("Verify Spring application context loads successfully")
    void contextLoads() {
        assertThat(dataSource).isNotNull();
    }

    @Test
    @DisplayName("Verify MySQL database connection is established")
    void verifyDatabaseConnectivity() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            assertThat(connection.isValid(2)).isTrue();
            assertThat(connection.getCatalog()).isEqualTo("aji_log_platform");
        }
    }
}

