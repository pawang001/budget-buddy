package com.budget_buddy.config;

import com.budget_buddy.service.CustomUserDetailsService;
import com.budget_buddy.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        // The manual check for public paths has been removed.
        // Spring Security's configuration in SecurityConfig is the single source of truth
        // for which endpoints are public (`.permitAll()`). This filter will now
        // consistently process the Authorization header for all requests.

        final String authHeader = request.getHeader("Authorization");
        final String token;
        final String email;

        // If there's no Authorization header or it doesn't start with "Bearer ",
        // continue to the next filter. Spring Security will then handle authorization
        // based on the rules in SecurityConfig.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        token = authHeader.substring(7);
        try {
            email = jwtUtil.extractUsername(token);
        } catch (Exception e) {
            // If token is invalid, just continue the filter chain.
            // The request will be rejected later as there's no authenticated user.
            logger.warn("Invalid JWT Token: " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        // If we have an email but the user is not yet authenticated in the current context
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);

            // If the token is valid, create an authentication token and set it in the SecurityContext
            if (jwtUtil.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null, // Credentials are not needed for JWT
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Continue the filter chain for the request to proceed
        filterChain.doFilter(request, response);
    }
}
