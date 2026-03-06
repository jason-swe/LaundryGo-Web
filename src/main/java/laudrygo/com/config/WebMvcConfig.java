package laudrygo.com.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import laudrygo.com.exception.util.TraceIdUtil;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.util.Arrays;

/**
 * Configuration để tự động tạo và quản lý Trace ID cho mỗi request
 * Và đăng ký Spring Web Converters cho HTTP param parsing
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * Đăng ký Spring Web Converters để parse HTTP params → Enum
     * Chạy ở tầng Web MVC
     */
    @Override
    public void addFormatters(FormatterRegistry registry) {

    }

    /**
     * Cấu hình CORS để cho phép FE gọi API
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5174")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("X-Trace-Id")
                .allowCredentials(true)
                .maxAge(3600);
    }

    /**
     * Bean để xử lý CORS filter
     */
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000", "http://localhost:5174"));
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setExposedHeaders(Arrays.asList("X-Trace-Id"));
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    /**
     * Filter để tự động tạo Trace ID cho mỗi request
     */
    @Bean
    public FilterRegistrationBean<TraceIdFilter> traceIdFilter() {
        FilterRegistrationBean<TraceIdFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new TraceIdFilter());
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }

    /**
     * Filter để tạo Trace ID từ header hoặc tạo mới
     */
    public static class TraceIdFilter extends OncePerRequestFilter {

        private static final String TRACE_ID_HEADER = "X-Trace-Id";

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {
            try {
                // Lấy Trace ID từ header hoặc tạo mới
                String traceId = request.getHeader(TRACE_ID_HEADER);
                if (traceId == null || traceId.isEmpty()) {
                    traceId = TraceIdUtil.generateTraceId();
                } else {
                    TraceIdUtil.setTraceId(traceId);
                }

                // Thêm Trace ID vào response header
                response.setHeader(TRACE_ID_HEADER, traceId);

                filterChain.doFilter(request, response);
            } finally {
                // Xóa Trace ID sau khi request hoàn thành
                TraceIdUtil.clearTraceId();
            }
        }
    }
}

