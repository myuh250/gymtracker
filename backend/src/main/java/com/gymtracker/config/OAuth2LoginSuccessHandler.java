package com.gymtracker.config;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.gymtracker.entity.User;
import com.gymtracker.enums.Role;
import com.gymtracker.repository.UserRepository;
import com.gymtracker.util.JwtUtils;

/**
 * Handles successful OAuth2 login (Google).
 * Responsibilities:
 * 1) Upsert user in DB (mark as OAuth user).
 * 2) Issue JWT for frontend.
 * 3) Redirect back to SPA with token & userId.
 */
@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${FRONT_END_URL:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response,
            Authentication authentication) throws IOException, jakarta.servlet.ServletException {

        if (!(authentication instanceof OAuth2AuthenticationToken oauthAuth)) {
            super.onAuthenticationSuccess(request, response, authentication);
            return;
        }

        DefaultOAuth2User oauthUser = (DefaultOAuth2User) oauthAuth.getPrincipal();

        String email = (String) oauthUser.getAttributes().getOrDefault("email", "");
        String fullName = (String) oauthUser.getAttributes().getOrDefault("name", "Google User");
        String picture = (String) oauthUser.getAttributes().getOrDefault("picture", null);
        String oauthId = (String) oauthUser.getAttributes().getOrDefault("sub", null);
        String provider = oauthAuth.getAuthorizedClientRegistrationId(); // e.g., "google"

        // Upsert user
        User user = userRepository.findByEmail(email).orElseGet(User::new);
        boolean isNew = user.getId() == null;
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(user.getRole() == null ? Role.ROLE_USER : user.getRole());
        user.setIsEnabled(user.getIsEnabled() == null ? true : user.getIsEnabled());
        user.setIsOauth(true);
        user.setOauthProvider(provider != null ? provider.toUpperCase() : "GOOGLE");
        user.setOauthId(oauthId);
        user.setAvatarUrl(picture);

        // passwordHash can remain null for OAuth users; not used for authentication here.
        userRepository.save(user);

        // Build JWT for SPA
        var authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()));
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash() == null ? "" : user.getPasswordHash(),
                authorities
        );

        String jwt = jwtUtils.generateToken(
                Map.of("role", user.getRole().name(), "userId", user.getId()),
                userDetails
        );

        // Redirect to frontend with token & userId (frontend will store and proceed)
        String redirectUrl = String.format(
                "%s/oauth2/callback?token=%s&userId=%s",
                frontendUrl,
                URLEncoder.encode(jwt, StandardCharsets.UTF_8),
                Optional.ofNullable(user.getId()).orElse(-1L)
        );

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
