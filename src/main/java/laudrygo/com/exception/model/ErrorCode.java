package laudrygo.com.exception.model;

import laudrygo.com.exception.base.BusinessException;

/**
 * Enum quản lý mã lỗi và message tiếng Việt
 * Chỉ chứa mã lỗi và message, hoàn toàn độc lập với HTTP layer
 * HTTP Status được quyết định ở tầng ExceptionHandler
 */
public enum ErrorCode {

    // Flask API errors
    FLASK_API_ERROR("FLASK_API_ERROR", "Lỗi khi gọi Flask API"),
    FLASK_API_TIMEOUT("FLASK_API_TIMEOUT", "Flask API không phản hồi"),
    FLASK_API_INVALID_RESPONSE("FLASK_API_INVALID_RESPONSE", "Dữ liệu từ Flask API không hợp lệ"),


    // User errors
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "Lỗi hệ thống nội bộ"),
    METHOD_NOT_ALLOWED("METHOD_NOT_ALLOWED", "Phương thức không được phép"),
    BAD_REQUEST("BAD_REQUEST", "Yêu cầu không hợp lệ"),
    USER_NOT_FOUND("USER_NOT_FOUND", "Người dùng không tồn tại"),
    INVALID_OLD_PASSWORD("INVALID_OLD_PASSWORD", "Mật khẩu cũ không đúng"),

    // Security/Authentication errors
    AUTHENTICATION_FAILED("AUTHENTICATION_FAILED", "Xác thực thất bại"),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Tên đăng nhập hoặc mật khẩu không đúng"),
    ACCESS_DENIED("ACCESS_DENIED", "Bạn không có quyền truy cập tài nguyên này"),
    USERNAME_EXISTS("USERNAME_EXISTS", "Tên đăng nhập đã tồn tại"),
    EMAIL_EXISTS("EMAIL_EXISTS", "Email đã tồn tại"),
    INVALID_PASSWORD_FORMAT("INVALID_PASSWORD_FORMAT", "Mật khẩu không đúng định dạng (tối thiểu 8 ký tự)"),
    INVALID_OTP_FORMAT("INVALID_OTP_FORMAT", "OTP không đúng định dạng"),
    OTP_EXPIRED("OTP_EXPIRED", "OTP đã hết hạn"),
    OTP_INVALID("OTP_INVALID", "OTP không đúng"),
    ACCOUNT_LOCKED_OR_INACTIVE("ACCOUNT_LOCKED_OR_INACTIVE", "Tài khoản bị khóa hoặc không hoạt động"),
    TOKEN_GENERATION_ERROR("TOKEN_GENERATION_ERROR", "Lỗi khi tạo token"),
    RATE_LIMIT_EXCEEDED("RATE_LIMIT_EXCEEDED", "Quá nhiều yêu cầu. Vui lòng thử lại sau");



    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    /**
     * Tạo BusinessException từ ErrorCode
     * Không map HttpStatus - HttpStatus sẽ được quyết định ở ExceptionHandler
     */
    public BusinessException toException() {
        return new BusinessException(this.code, this.message);
    }

    /**
     * Tạo BusinessException từ ErrorCode với message tùy chỉnh
     */
    public BusinessException toException(String customMessage) {
        return new BusinessException(this.code, customMessage);
    }

    /**
     * Tạo BusinessException từ ErrorCode với format message
     */
    public BusinessException toException(Object... args) {
        String formattedMessage = String.format(this.message, args);
        return new BusinessException(this.code, formattedMessage);
    }
}
