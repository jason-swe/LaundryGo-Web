package laudrygo.com.sercurity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueResponse;

import jakarta.annotation.PostConstruct;

/**
 * Service để lấy secret từ AWS Secrets Manager
 */
@Service
public class SecretsManagerService {

    @Value("${aws.secrets.jwt-secret-name:prod/HRM}")
    private String jwtSecretName;

    private final SecretsManagerClient secretsManagerClient;
    private String jwtSecretKey;

    @Autowired
    public SecretsManagerService(SecretsManagerClient secretsManagerClient) {
        this.secretsManagerClient = secretsManagerClient;
    }

    @PostConstruct
    public void init() {
        try {
            // Lấy JWT secret key từ AWS Secrets Manager
            jwtSecretKey = getSecret(jwtSecretName);
            System.out.println("Successfully loaded JWT secret from AWS Secrets Manager: " + jwtSecretName);
        } catch (Exception e) {
            // Nếu không kết nối được AWS, throw exception để ứng dụng không khởi động
            System.err.println("ERROR: Cannot connect to AWS Secrets Manager. Application cannot start without JWT secret.");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to load JWT secret from AWS Secrets Manager", e);
        }
    }

    /**
     * Lấy secret từ AWS Secrets Manager
     * @param secretName tên của secret trong AWS Secrets Manager
     * @return giá trị của secret
     */
    public String getSecret(String secretName) {
        GetSecretValueRequest getSecretValueRequest = GetSecretValueRequest.builder()
                .secretId(secretName)
                .build();

        GetSecretValueResponse getSecretValueResponse;
        try {
            getSecretValueResponse = secretsManagerClient.getSecretValue(getSecretValueRequest);
        } catch (Exception e) {
            // Log lỗi và throw lại
            System.err.println("Error getting secret from AWS Secrets Manager: " + e.getMessage());
            throw e;
        }

        String secret = getSecretValueResponse.secretString();

        // Trim whitespace và kiểm tra
        if (secret != null) {
            secret = secret.trim();
        }

        return secret;
    }

    /**
     * Lấy JWT secret key (đã được cache sau khi init)
     */
    public String getJwtSecretKey() {
        if (jwtSecretKey == null) {
            throw new IllegalStateException("JWT secret key has not been loaded from AWS Secrets Manager");
        }
        return jwtSecretKey;
    }

    /**
     * Refresh JWT secret key từ AWS
     */
    public void refreshJwtSecretKey() {
        try {
            jwtSecretKey = getSecret(jwtSecretName);
            System.out.println("Successfully refreshed JWT secret from AWS Secrets Manager");
        } catch (Exception e) {
            System.err.println("Error refreshing JWT secret key: " + e.getMessage());
            throw new RuntimeException("Failed to refresh JWT secret key", e);
        }
    }
}
