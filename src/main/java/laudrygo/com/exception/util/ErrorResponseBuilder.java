package laudrygo.com.exception.util;

import laudrygo.com.exception.model.ErrorResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

/**
 * Builder class - Chỉ chịu trách nhiệm build ErrorResponse
 */
@Component
public class ErrorResponseBuilder {

    /**
     * Build ErrorResponse từ các thông tin
     */
    public ErrorResponse build(int status, String errorCode, String message, WebRequest request) {
        String traceId = TraceIdUtil.getTraceId();
        String path = request.getDescription(false).replace("uri=", "");

        return ErrorResponse.builder()
                .status(status)
                .errorCode(errorCode)
                .message(message)
                .traceId(traceId)
                .timestamp(LocalDateTime.now())
                .path(path)
                .build();
    }

    /**
     * Build ErrorResponse với message tùy chỉnh
     */
    public ErrorResponse build(int status, String errorCode, String message, String customMessage, WebRequest request) {
        String traceId = TraceIdUtil.getTraceId();
        String path = request.getDescription(false).replace("uri=", "");

        return ErrorResponse.builder()
                .status(status)
                .errorCode(errorCode)
                .message(customMessage)
                .traceId(traceId)
                .timestamp(LocalDateTime.now())
                .path(path)
                .build();
    }
}

