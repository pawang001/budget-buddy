package com.budget_buddy.config;

import com.budget_buddy.model.User;
import com.budget_buddy.repo.UserRepo;
import com.budget_buddy.utils.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepo userRepo;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Fetch or create the user in the database
        Optional<User> userOptional = userRepo.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
        } else {
            user = new User();
            user.setEmail(email);
            user.setUsername(name);
            userRepo.save(user);
        }

        // Generate JWT token
        String jwtToken = jwtUtil.generateToken(email);

        // Redirect to frontend with the token (e.g. React app at localhost:5173)
        String redirectUrl = "http://localhost:5173/login?token=" + URLEncoder.encode(jwtToken, StandardCharsets.UTF_8);
        response.sendRedirect(redirectUrl);
    }
}
