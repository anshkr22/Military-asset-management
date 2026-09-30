package com.military.assetmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfig {

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();

                // Read our custom "role" claim from the JWT.
                authoritiesConverter.setAuthoritiesClaimName("role");

                // ADMIN becomes ROLE_ADMIN.
                authoritiesConverter.setAuthorityPrefix("ROLE_");

                JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();

                jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(
                                authoritiesConverter);

                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(withDefaults())

                                .authorizeHttpRequests(auth -> auth

                                                // Login does not require a JWT.
                                                .requestMatchers("/api/auth/**").permitAll()

                                                // ADMIN and BASE_COMMANDER
                                                .requestMatchers("/api/asset-types/**")
                                                .hasAnyRole("ADMIN", "LOGISTICS_OFFICER")

                                                .requestMatchers(
                                                                "/api/bases/**",
                                                                "/api/assets/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "BASE_COMMANDER", "LOGISTICS_OFFICER")

                                                // ADMIN and LOGISTICS_OFFICER
                                                .requestMatchers(
                                                                "/api/purchases/**",
                                                                "/api/transfers/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "LOGISTICS_OFFICER")
                                                .requestMatchers("/api/assignments/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "BASE_COMMANDER")

                                                .requestMatchers("/api/users/**")
                                                .hasAnyRole("ADMIN", "BASE_COMMANDER")

                                                .requestMatchers("/api/expenditures/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "BASE_COMMANDER")

                                                .requestMatchers("/api/dashboard/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "BASE_COMMANDER")

                                                .requestMatchers("/api/audit-logs/**")
                                                .hasRole("ADMIN")

                                                // Everything else requires authentication.
                                                .anyRequest().authenticated())

                                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(
                                                jwtAuthenticationConverter)));

                return http.build();
        }
}