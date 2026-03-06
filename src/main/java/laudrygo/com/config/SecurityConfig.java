package laudrygo.com.config;

import laudrygo.com.sercurity.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


/**
 * Cấu hình bảo mật cho ứng dụng Spring Boot
 * Bao gồm JWT authentication, authorization và các filter bảo mật
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    /**
     * Cấu hình Security Filter Chain
     * @param http HttpSecurity object để cấu hình
     * @return SecurityFilterChain đã được cấu hình
     * @throws Exception nếu có lỗi trong quá trình cấu hình
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable());
        http.cors(cors -> cors.configurationSource(request -> {
            org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
            configuration.setAllowedOrigins(java.util.Arrays.asList("http://localhost:3000"));
            configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
            configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
            configuration.setExposedHeaders(java.util.Arrays.asList("X-Trace-Id"));
            configuration.setAllowCredentials(true);
            configuration.setMaxAge(3600L);
            return configuration;
        }));
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.authorizeHttpRequests(auth -> auth
                // Public endpoints - không cần authentication
                .requestMatchers(

                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/swagger-resources/**",
                        "/swagger-ui.html"

                        ).permitAll()
                // Admin endpoints - chỉ ADMIN mới truy cập được
                // (Các endpoints này đã được move lên public endpoints ở trên)
                .requestMatchers(
                        "/salary/**"
                ).hasRole("ADMIN")
                // Employee endpoints - ADMIN và EMPLOYEE đều truy cập được
                // Employee chỉ xem được profile của chính mình (kiểm tra trong service)
                .requestMatchers(
                        "/employee/profile/**"
                ).hasAnyRole()
                // Các endpoint khác yêu cầu authentication
                .anyRequest().authenticated());
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);// Tắt CSRF vì sử dụng JWT
// Cấu hình CORS
// Cấu hình session management thành stateless
// Cấu hình authorization rules - phân quyền theo role
// Thêm JWT filter trước UsernamePasswordAuthenticationFilter
        return http
                .build();
    }

    /**
     * Cấu hình Password Encoder sử dụng BCrypt
     * @return BCryptPasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Cấu hình Authentication Manager
     * @param config AuthenticationConfiguration
     * @return AuthenticationManager instance
     * @throws Exception nếu có lỗi trong quá trình cấu hình
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

