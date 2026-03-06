package laudrygo.com.exception.handler;

import jakarta.validation.ConstraintViolationException;
import laudrygo.com.exception.base.BusinessException;
import laudrygo.com.exception.model.ErrorCode;
import laudrygo.com.exception.model.ErrorResponse;
import laudrygo.com.exception.specifiic.FlaskApiException;
import laudrygo.com.exception.specifiic.ForbiddenException;
import laudrygo.com.exception.specifiic.ResourceNotFoundException;
import laudrygo.com.exception.util.ErrorResponseBuilder;
import laudrygo.com.exception.util.ExceptionLogger;
import laudrygo.com.exception.util.ValidationErrorExtractor;
import laudrygo.com.mapper.HttpStatusMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Global Exception Handler - Chỉ chịu trách nhiệm orchestration, delegate các trách nhiệm cụ thể
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private final ErrorResponseBuilder errorResponseBuilder;
    private final ExceptionLogger exceptionLogger;
    private final ValidationErrorExtractor validationErrorExtractor;
    private final HttpStatusMapper httpStatusMapper;

    @Autowired
    public GlobalExceptionHandler(ErrorResponseBuilder errorResponseBuilder,
                                  ExceptionLogger exceptionLogger,
                                  ValidationErrorExtractor validationErrorExtractor,
                                  HttpStatusMapper httpStatusMapper) {
        this.errorResponseBuilder = errorResponseBuilder;
        this.exceptionLogger = exceptionLogger;
        this.validationErrorExtractor = validationErrorExtractor;
        this.httpStatusMapper = httpStatusMapper;
    }

    /**
     * Xử lý BusinessException
     * Mapping ErrorCode → HttpStatus được delegate cho HttpStatusMapper
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex, WebRequest request) {
        String errorCode = ex.getErrorCode() == null ? "BUSINESS_ERROR" : ex.getErrorCode();
        HttpStatus status = httpStatusMapper.toHttpStatus(errorCode);

        ErrorResponse error = errorResponseBuilder.build(status.value(), errorCode, ex.getMessage(), request);
        exceptionLogger.logBusinessException(error.getTraceId(), errorCode, ex.getMessage());

        return new ResponseEntity<>(error, status);
    }

    /**
     * Xử lý ResourceNotFoundException
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse error = errorResponseBuilder.build(
                HttpStatus.NOT_FOUND.value(),
                ErrorCode.USER_NOT_FOUND.getCode(),
                ex.getMessage(),
                request);

        exceptionLogger.logResourceNotFoundException(error.getTraceId(), ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    /**
     * Xử lý ValidationException (MethodArgumentNotValidException)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        var errors = validationErrorExtractor.extractErrors(ex);
        String message = validationErrorExtractor.formatErrorMessage(errors);

        ErrorResponse error = errorResponseBuilder.build(
                HttpStatus.BAD_REQUEST.value(),
                ErrorCode.BAD_REQUEST.getCode(),
                message,
                request);

        exceptionLogger.logValidationException(error.getTraceId(), errors);

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xử lý ConstraintViolationException
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex, WebRequest request) {
        String message = "Vi phạm ràng buộc dữ liệu: " + ex.getMessage();

        ErrorResponse error = errorResponseBuilder.build(
                HttpStatus.BAD_REQUEST.value(),
                ErrorCode.BAD_REQUEST.getCode(),
                message,
                request);

        exceptionLogger.logConstraintViolationException(error.getTraceId(), ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xử lý MethodArgumentTypeMismatchException
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException ex, WebRequest request) {
        String message = String.format(
                "Tham số '%s' không hợp lệ. Giá trị '%s' không thể chuyển đổi sang kiểu dữ liệu yêu cầu",
                ex.getName(), ex.getValue());

        ErrorResponse error = errorResponseBuilder.build(
                HttpStatus.BAD_REQUEST.value(),
                ErrorCode.BAD_REQUEST.getCode(),
                message,
                request);

        exceptionLogger.logMethodArgumentTypeMismatchException(error.getTraceId(), ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xử lý UsernameNotFoundException (Security)
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUsernameNotFoundException(
            UsernameNotFoundException ex, WebRequest request) {
        ErrorResponse error = errorResponseBuilder.build(
                HttpStatus.UNAUTHORIZED.value(),
                ErrorCode.AUTHENTICATION_FAILED.getCode(),
                ex.getMessage(),
                request);

        exceptionLogger.logAuthenticationException(error.getTraceId(), ErrorCode.AUTHENTICATION_FAILED.getCode(), ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Xử lý BadCredentialsException (Security)
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(
            BadCredentialsException ex, WebRequest request) {
        ErrorResponse error = errorResponseBuilder.build(
                HttpStatus.UNAUTHORIZED.value(),
                ErrorCode.INVALID_CREDENTIALS.getCode(),
                ErrorCode.INVALID_CREDENTIALS.getMessage(),
                request);

        exceptionLogger.logAuthenticationException(error.getTraceId(), ErrorCode.INVALID_CREDENTIALS.getCode(), ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Xử lý AccessDeniedException (Security)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        ErrorResponse error = errorResponseBuilder.build(
                HttpStatus.FORBIDDEN.value(),
                ErrorCode.ACCESS_DENIED.getCode(),
                ErrorCode.ACCESS_DENIED.getMessage(),
                request);

        exceptionLogger.logAuthorizationException(error.getTraceId(), ErrorCode.ACCESS_DENIED.getCode(), ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    /**
     * Xử lý ForbiddenException (Custom Forbidden)
     */
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbiddenException(
            ForbiddenException ex, WebRequest request) {
        ErrorResponse error = errorResponseBuilder.build(
                HttpStatus.FORBIDDEN.value(),
                ErrorCode.ACCESS_DENIED.getCode(),
                ex.getMessage(),
                request);

        exceptionLogger.logAuthorizationException(error.getTraceId(), ErrorCode.ACCESS_DENIED.getCode(), ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    /**
     * Xử lý FlaskApiException
     */
    @ExceptionHandler(FlaskApiException.class)
    public ResponseEntity<ErrorResponse> handleFlaskApiException(FlaskApiException ex, WebRequest request) {
        String errorCode = ex.getErrorCode() == null ? ErrorCode.FLASK_API_ERROR.getCode() : ex.getErrorCode();
        HttpStatus status = HttpStatus.BAD_GATEWAY; // 502 Bad Gateway cho external API errors

        ErrorResponse error = errorResponseBuilder.build(
                status.value(),
                errorCode,
                ex.getMessage(),
                request);

        exceptionLogger.logBusinessException(
                error.getTraceId(),
                errorCode,
                String.format("Flask API Error [%s]: %s", ex.getApiEndpoint(), ex.getMessage())
        );

        return new ResponseEntity<>(error, status);
    }

    /**
     * Xử lý tất cả các Exception khác (catch-all)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, WebRequest request) {
        ErrorResponse error = errorResponseBuilder.build(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                ErrorCode.INTERNAL_SERVER_ERROR.getMessage(),
                request);

        exceptionLogger.logGenericException(error.getTraceId(), ex.getMessage(), ex);

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

