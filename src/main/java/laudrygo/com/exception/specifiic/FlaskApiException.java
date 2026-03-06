package laudrygo.com.exception.specifiic;

import laudrygo.com.exception.base.BusinessException;

/**
 * Custom exception cho Flask API errors
 * Kế thừa BusinessException để tương thích với GlobalExceptionHandler
 */
public class FlaskApiException extends BusinessException {

    private final String apiEndpoint;
    private final Integer httpStatus;

    public FlaskApiException(String message) {
        super("FLASK_API_ERROR", message);
        this.apiEndpoint = null;
        this.httpStatus = null;
    }

    public FlaskApiException(String message, String apiEndpoint) {
        super("FLASK_API_ERROR", message);
        this.apiEndpoint = apiEndpoint;
        this.httpStatus = null;
    }

    public FlaskApiException(String message, String apiEndpoint, Integer httpStatus) {
        super("FLASK_API_ERROR", message);
        this.apiEndpoint = apiEndpoint;
        this.httpStatus = httpStatus;
    }

    public FlaskApiException(String message, Throwable cause) {
        super("FLASK_API_ERROR", message, cause);
        this.apiEndpoint = null;
        this.httpStatus = null;
    }

    public FlaskApiException(String message, String apiEndpoint, Throwable cause) {
        super("FLASK_API_ERROR", message, cause);
        this.apiEndpoint = apiEndpoint;
        this.httpStatus = null;
    }

    public String getApiEndpoint() {
        return apiEndpoint;
    }

    public Integer getHttpStatus() {
        return httpStatus;
    }
}

