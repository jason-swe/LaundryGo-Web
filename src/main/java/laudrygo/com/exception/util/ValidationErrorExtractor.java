package laudrygo.com.exception.util;

import org.springframework.stereotype.Component;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.HashMap;
import java.util.Map;

/**
 * Extractor class - Chỉ chịu trách nhiệm extract validation errors từ exception
 */
@Component
public class ValidationErrorExtractor {

    /**
     * Extract validation errors từ MethodArgumentNotValidException
     */
    public Map<String, String> extractErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage != null ? errorMessage : "Validation failed");
        });

        return errors;
    }

    /**
     * Format validation errors thành message string
     */
    public String formatErrorMessage(Map<String, String> errors) {
        return "Dữ liệu đầu vào không hợp lệ: " + errors.toString();
    }
}

