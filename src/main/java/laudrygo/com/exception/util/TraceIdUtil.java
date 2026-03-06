package laudrygo.com.exception.util;
import java.util.UUID;

/**
 * Utility class để quản lý Trace ID
 */
public class TraceIdUtil {

    private static final ThreadLocal<String> traceId = new ThreadLocal<>();

    /**
     * Tạo và set Trace ID cho request hiện tại
     */
    public static String generateTraceId() {
        String id = UUID.randomUUID().toString();
        traceId.set(id);
        return id;
    }

    /**
     * Lấy Trace ID của request hiện tại
     */
    public static String getTraceId() {
        String id = traceId.get();
        if (id == null) {
            id = generateTraceId();
        }
        return id;
    }

    /**
     * Set Trace ID từ request header hoặc external source
     */
    public static void setTraceId(String id) {
        traceId.set(id);
    }

    /**
     * Xóa Trace ID sau khi request hoàn thành
     */
    public static void clearTraceId() {
        traceId.remove();
    }
}

