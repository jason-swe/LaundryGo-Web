package laudrygo.com.exception.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Logger class - Chỉ chịu trách nhiệm log exceptions
 */
@Component
public class ExceptionLogger {

    private static final Logger logger = LoggerFactory.getLogger(ExceptionLogger.class);

    /**
     * Log BusinessException
     */
    public void logBusinessException(String traceId, String errorCode, String message) {
        logger.warn("BusinessException [{}]: {} - {}", traceId, errorCode, message);
    }

    /**
     * Log ResourceNotFoundException
     */
    public void logResourceNotFoundException(String traceId, String message) {
        logger.warn("ResourceNotFoundException [{}]: {}", traceId, message);
    }

    /**
     * Log ValidationException
     */
    public void logValidationException(String traceId, Object errors) {
        logger.warn("ValidationException [{}]: {}", traceId, errors);
    }

    /**
     * Log ConstraintViolationException
     */
    public void logConstraintViolationException(String traceId, String message) {
        logger.warn("ConstraintViolationException [{}]: {}", traceId, message);
    }

    /**
     * Log MethodArgumentTypeMismatchException
     */
    public void logMethodArgumentTypeMismatchException(String traceId, String message) {
        logger.warn("MethodArgumentTypeMismatchException [{}]: {}", traceId, message);
    }

    /**
     * Log Authentication Exception (UsernameNotFoundException, BadCredentialsException)
     */
    public void logAuthenticationException(String traceId, String errorCode, String message) {
        logger.warn("AuthenticationException [{}]: {} - {}", traceId, errorCode, message);
    }

    /**
     * Log Authorization Exception (AccessDeniedException)
     */
    public void logAuthorizationException(String traceId, String errorCode, String message) {
        logger.warn("AuthorizationException [{}]: {} - {}", traceId, errorCode, message);
    }

    /**
     * Log generic Exception
     */
    public void logGenericException(String traceId, String message, Exception ex) {
        logger.error("Unhandled Exception [{}]: {}", traceId, message, ex);
    }
}

