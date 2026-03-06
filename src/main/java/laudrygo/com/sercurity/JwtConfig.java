package laudrygo.com.sercurity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@EnableConfigurationProperties
@ConfigurationProperties(prefix = "security.jwt")
public class JwtConfig {
    private String issuer = "hrm-system";
    private long accessTokenTtl = 3600;   // seconds
    private long refreshTokenTtl = 86400;  // seconds
    private String kmsKeyId;       // AWS KMS key for signing
}

