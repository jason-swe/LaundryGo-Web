package laudrygo.com.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Value("${spring.datasource.hikari.minimum-idle:5}")
    private int minimumIdle;

    @Value("${spring.datasource.hikari.maximum-pool-size:10}")
    private int maximumPoolSize;

    @Value("${spring.datasource.hikari.connection-timeout:30000}")
    private long connectionTimeout;

    @Value("${spring.datasource.hikari.idle-timeout:300000}")
    private long idleTimeout;

    @Value("${spring.datasource.hikari.max-lifetime:1800000}")
    private long maxLifetime;

    @Value("${spring.datasource.hikari.auto-commit:false}")
    private boolean autoCommit;

    @Value("${spring.datasource.hikari.pool-name:HikariPool-HRM}")
    private String poolName;

    @Value("${spring.datasource.hikari.connection-test-query:SELECT 1}")
    private String connectionTestQuery;

    @Bean
    @Primary
    public DataSource dataSource() {
        // Set system timezone trước khi tạo connection
        System.setProperty("user.timezone", "UTC");
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"));

        HikariConfig config = new HikariConfig();
        // Đảm bảo URL có TimeZone=UTC
        String url = jdbcUrl;
        if (!url.contains("TimeZone=")) {
            url += (url.contains("?") ? "&" : "?") + "TimeZone=UTC";
        }
        // Xóa các TimeZone khác nếu có và thay bằng UTC
        url = url.replaceAll("TimeZone=[^&]*", "TimeZone=UTC");
        if (!url.contains("TimeZone=")) {
            url += (url.contains("?") ? "&" : "?") + "TimeZone=UTC";
        }

        // Basic connection settings
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName(driverClassName);

        // Connection pool settings
        config.setMinimumIdle(minimumIdle);
        config.setMaximumPoolSize(maximumPoolSize);
        config.setConnectionTimeout(connectionTimeout);
        config.setIdleTimeout(idleTimeout);
        config.setMaxLifetime(maxLifetime);
        config.setAutoCommit(autoCommit);
        config.setPoolName(poolName);
        config.setConnectionTestQuery(connectionTestQuery);

        // Additional settings
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");

        return new HikariDataSource(config);
    }
}


