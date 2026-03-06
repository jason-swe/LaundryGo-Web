package laudrygo.com.dto;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để nhận response từ Flask API (Flask trả về String cho status)
 * Sau đó sẽ convert sang SystemStatusDTO với enum
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemStatusResponseDTO {
    @JsonProperty("status")
    private String status;  // String từ Flask API: "idle", "running", "success", "error"

    @JsonProperty("message")
    private String message;

    @JsonProperty("last_updated")
    private Double lastUpdated;  // Flask trả về timestamp (double)
}
