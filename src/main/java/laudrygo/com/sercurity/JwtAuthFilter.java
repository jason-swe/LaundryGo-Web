package laudrygo.com.sercurity;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter xử lý JWT authentication cho mỗi request
 * Kiểm tra và xác thực JWT token từ header Authorization
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Xử lý authentication cho mỗi HTTP request
     * @param request HTTP request
     * @param response HTTP response
     * @param filterChain chuỗi filter tiếp theo
     * @throws ServletException nếu có lỗi servlet
     * @throws IOException nếu có lỗi I/O
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // Kiểm tra xem request có chứa JWT token không
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Trích xuất JWT token từ header
            final String jwt = authHeader.substring(7);

            // Kiểm tra token đã bị thu hồi chưa
            if (jwtService.isTokenRevoked(jwt)) {
                logger.debug("Token đã bị thu hồi");
                filterChain.doFilter(request, response);
                return;
            }

            // Kiểm tra token type (chỉ chấp nhận access token)
            if (!jwtService.isAccessToken(jwt)) {
                logger.debug("Token không phải là access token");
                filterChain.doFilter(request, response);
                return;
            }

            // Trích xuất username từ token
            final String username = jwtService.extractUsername(jwt);

            // Xác thực token nếu chưa có authentication trong SecurityContext
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                    // Kiểm tra tính hợp lệ của token
                    if (jwtService.isTokenValid(jwt, userDetails)) {
                        // Tạo authentication token và set vào SecurityContext
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        logger.debug("Xác thực thành công cho user: {}", username);
                    } else {
                        logger.debug("Token không hợp lệ cho user: {}", username);
                    }
                } catch (UsernameNotFoundException e) {
                    logger.warn("Không tìm thấy user: {}", username);
                    // Tiếp tục filter chain - để Spring Security xử lý authorization
                }
            }
        } catch (ExpiredJwtException e) {
            logger.debug("JWT token đã hết hạn: {}", e.getMessage());
            // Tiếp tục filter chain - để Spring Security xử lý request không được xác thực
        } catch (MalformedJwtException e) {
            logger.debug("JWT token không đúng định dạng: {}", e.getMessage());
            // Tiếp tục filter chain - token không hợp lệ, để Spring Security xử lý
        } catch (SignatureException e) {
            logger.debug("JWT signature không hợp lệ: {}", e.getMessage());
            // Tiếp tục filter chain - chữ ký không hợp lệ, để Spring Security xử lý
        } catch (JwtException e) {
            logger.debug("Lỗi xử lý JWT: {}", e.getMessage());
            // Tiếp tục filter chain - lỗi JWT, để Spring Security xử lý
        } catch (IllegalArgumentException e) {
            logger.debug("JWT token rỗng hoặc null: {}", e.getMessage());
            // Tiếp tục filter chain - định dạng token không hợp lệ
        } catch (Exception e) {
            logger.error("Lỗi không mong đợi trong quá trình xác thực JWT", e);
            // Tiếp tục filter chain - không làm gián đoạn ứng dụng
        }

        filterChain.doFilter(request, response);
    }
}
