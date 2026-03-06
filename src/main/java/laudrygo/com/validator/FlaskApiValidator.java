package laudrygo.com.validator;


import laudrygo.com.exception.specifiic.FlaskApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Validator class - Chỉ chịu trách nhiệm validate dữ liệu từ Flask API
 * Không chứa business logic hay logic lưu trữ
 */
@Component
public class FlaskApiValidator {

    private static final Logger logger = LoggerFactory.getLogger(FlaskApiValidator.class);

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Validate employee ID string và convert sang Long
     *
     * @param id Employee ID string từ Flask API
     * @return Long employee ID
     * @throws FlaskApiException nếu không thể parse
     */
    public Long validateEmployeeId(String id) {
        if (id == null || id.trim().isEmpty()) {
            logger.warn("Flask API returned null or empty employee ID");
            throw new FlaskApiException("Employee ID không được để trống");
        }

        try {
            Long employeeId = Long.parseLong(id.trim());
            logger.debug("Successfully validated employee ID: {}", employeeId);
            return employeeId;
        } catch (NumberFormatException e) {
            logger.error("Invalid employee ID format from Flask API: {}", id, e);
            throw new FlaskApiException(
                    String.format("Employee ID không hợp lệ: %s. Lỗi: %s", id, e.getMessage()),
                    e
            );
        }
    }

    /**
     * Validate employee ID string (optional) - trả về null nếu empty
     *
     * @param id Employee ID string từ Flask API
     * @return Long employee ID hoặc null nếu empty
     * @throws FlaskApiException nếu format không hợp lệ
     */
    public Long validateEmployeeIdOptional(String id) {
        if (id == null || id.trim().isEmpty()) {
            return null;
        }
        return validateEmployeeId(id);
    }

    /**
     * Validate enum value và convert sang Enum
     *
     * @param enumType Enum class
     * @param value String value từ Flask API
     * @return Enum value
     * @throws FlaskApiException nếu không hợp lệ
     */
    public <E extends Enum<E>> E validateEnum(Class<E> enumType, String value) {
        if (value == null || value.trim().isEmpty()) {
            logger.warn("Flask API returned null or empty enum value for {}", enumType.getSimpleName());
            throw new FlaskApiException(
                    String.format("Giá trị enum %s không được để trống", enumType.getSimpleName())
            );
        }

        try {
            E enumValue = Enum.valueOf(enumType, value.trim().toUpperCase());
            logger.debug("Successfully validated enum {}: {}", enumType.getSimpleName(), enumValue);
            return enumValue;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid enum value from Flask API: {} for type {}", value, enumType.getSimpleName(), e);
            throw new FlaskApiException(
                    String.format("Giá trị enum không hợp lệ: %s cho type %s. Lỗi: %s",
                            value, enumType.getSimpleName(), e.getMessage()),
                    e
            );
        }
    }

    /**
     * Validate enum value (optional) - trả về null nếu empty
     *
     * @param enumType Enum class
     * @param value String value từ Flask API
     * @return Enum value hoặc null nếu empty
     * @throws FlaskApiException nếu format không hợp lệ
     */
    public <E extends Enum<E>> E validateEnumOptional(Class<E> enumType, String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return validateEnum(enumType, value);
    }

    /**
     * Validate date string và convert sang LocalDate
     *
     * @param dateStr Date string từ Flask API (format: ISO_DATE yyyy-MM-dd)
     * @return LocalDate
     * @throws FlaskApiException nếu không thể parse
     */
    public LocalDate validateDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            logger.warn("Flask API returned null or empty date");
            throw new FlaskApiException("Ngày không được để trống");
        }

        try {
            LocalDate date = LocalDate.parse(dateStr.trim(), DATE_FORMATTER);
            logger.debug("Successfully validated date: {}", date);
            return date;
        } catch (DateTimeParseException e) {
            logger.error("Invalid date format from Flask API: {}", dateStr, e);
            throw new FlaskApiException(
                    String.format("Định dạng ngày không hợp lệ: %s. Định dạng yêu cầu: yyyy-MM-dd. Lỗi: %s",
                            dateStr, e.getMessage()),
                    e
            );
        }
    }

    /**
     * Validate date string (optional) - trả về null nếu empty
     *
     * @param dateStr Date string từ Flask API
     * @return LocalDate hoặc null nếu empty
     * @throws FlaskApiException nếu format không hợp lệ
     */
    public LocalDate validateDateOptional(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }
        return validateDate(dateStr);
    }

    /**
     * Validate time string và convert sang LocalTime
     *
     * @param timeStr Time string từ Flask API (format: HH:mm:ss)
     * @return LocalTime
     * @throws FlaskApiException nếu không thể parse
     */
    public LocalTime validateTime(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) {
            logger.warn("Flask API returned null or empty time");
            throw new FlaskApiException("Thời gian không được để trống");
        }

        try {
            LocalTime time = LocalTime.parse(timeStr.trim(), TIME_FORMATTER);
            logger.debug("Successfully validated time: {}", time);
            return time;
        } catch (DateTimeParseException e) {
            logger.error("Invalid time format from Flask API: {}", timeStr, e);
            throw new FlaskApiException(
                    String.format("Định dạng thời gian không hợp lệ: %s. Định dạng yêu cầu: HH:mm:ss. Lỗi: %s",
                            timeStr, e.getMessage()),
                    e
            );
        }
    }

    /**
     * Validate time string (optional) - trả về null nếu empty
     *
     * @param timeStr Time string từ Flask API
     * @return LocalTime hoặc null nếu empty
     * @throws FlaskApiException nếu format không hợp lệ
     */
    public LocalTime validateTimeOptional(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) {
            return null;
        }
        return validateTime(timeStr);
    }

    /**
     * Validate datetime string và convert sang LocalDateTime
     *
     * @param datetimeStr DateTime string từ Flask API (format: ISO_LOCAL_DATE_TIME)
     * @return LocalDateTime
     * @throws FlaskApiException nếu không thể parse
     */
    public LocalDateTime validateDateTime(String datetimeStr) {
        if (datetimeStr == null || datetimeStr.trim().isEmpty()) {
            logger.warn("Flask API returned null or empty datetime");
            throw new FlaskApiException("Ngày giờ không được để trống");
        }

        try {
            LocalDateTime datetime = LocalDateTime.parse(datetimeStr.trim(), DATETIME_FORMATTER);
            logger.debug("Successfully validated datetime: {}", datetime);
            return datetime;
        } catch (DateTimeParseException e) {
            logger.error("Invalid datetime format from Flask API: {}", datetimeStr, e);
            throw new FlaskApiException(
                    String.format("Định dạng ngày giờ không hợp lệ: %s. Định dạng yêu cầu: yyyy-MM-ddTHH:mm:ss. Lỗi: %s",
                            datetimeStr, e.getMessage()),
                    e
            );
        }
    }

    /**
     * Validate datetime string (optional) - trả về null nếu empty
     *
     * @param datetimeStr DateTime string từ Flask API
     * @return LocalDateTime hoặc null nếu empty
     * @throws FlaskApiException nếu format không hợp lệ
     */
    public LocalDateTime validateDateTimeOptional(String datetimeStr) {
        if (datetimeStr == null || datetimeStr.trim().isEmpty()) {
            return null;
        }
        return validateDateTime(datetimeStr);
    }

    /**
     * Validate timestamp (Long) và convert sang LocalDateTime
     * @return LocalDateTime
     * @throws FlaskApiException nếu timestamp null
     */
    public LocalDateTime validateTimestamp(java.time.Instant instant) {
        if (instant == null) {
            logger.warn("Flask API returned null timestamp");
            throw new FlaskApiException("Timestamp không được để trống");
        }

        try {
            LocalDateTime datetime = LocalDateTime.ofInstant(instant, java.time.ZoneId.systemDefault());
            logger.debug("Successfully validated timestamp: {}", datetime);
            return datetime;
        } catch (Exception e) {
            logger.error("Invalid timestamp from Flask API: {}", instant, e);
            throw new FlaskApiException(
                    String.format("Timestamp không hợp lệ: %s. Lỗi: %s", instant, e.getMessage()),
                    e
            );
        }
    }

    /**
     * Validate timestamp (Long) và convert sang LocalDateTime
     *
     * @param timestamp Timestamp từ Flask API (epoch seconds)
     * @return LocalDateTime
     * @throws FlaskApiException nếu timestamp null
     */
    public LocalDateTime validateTimestamp(Long timestamp) {
        if (timestamp == null) {
            logger.warn("Flask API returned null timestamp");
            throw new FlaskApiException("Timestamp không được để trống");
        }

        try {
            LocalDateTime datetime = LocalDateTime.ofInstant(
                    java.time.Instant.ofEpochSecond(timestamp),
                    java.time.ZoneId.systemDefault()
            );
            logger.debug("Successfully validated timestamp: {} -> {}", timestamp, datetime);
            return datetime;
        } catch (Exception e) {
            logger.error("Invalid timestamp from Flask API: {}", timestamp, e);
            throw new FlaskApiException(
                    String.format("Timestamp không hợp lệ: %s. Lỗi: %s", timestamp, e.getMessage()),
                    e
            );
        }
    }

    /**
     * Validate timestamp (optional) - trả về null nếu null
     *
     * @param timestamp Timestamp từ Flask API
     * @return LocalDateTime hoặc null nếu null
     * @throws FlaskApiException nếu format không hợp lệ
     */
    public LocalDateTime validateTimestampOptional(Long timestamp) {
        if (timestamp == null) {
            return null;
        }
        return validateTimestamp(timestamp);
    }
}


