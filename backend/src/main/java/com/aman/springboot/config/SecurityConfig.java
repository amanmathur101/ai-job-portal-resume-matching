package com.aman.springboot.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    // Yahan maine aapka Vercel URL default value mein daal diya hai!
    @Value("${ALLOWED_ORIGINS:http://localhost:5173,https://ai-job-portal-resume-matching.vercel.app}")
    private String allowedOriginsRaw;

    @Bean
    public AuthenticationProvider authProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(new BCryptPasswordEncoder());
        provider.setHideUserNotFoundExceptions(false);
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/api/users/register", "/api/users/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/jobs/all").permitAll()

                .requestMatchers(HttpMethod.POST, "/api/jobs/post").hasAnyRole("ADMIN", "RECRUITER")
                .requestMatchers(HttpMethod.PUT,  "/api/jobs/post").hasAnyRole("ADMIN","RECRUITER")
                .requestMatchers(HttpMethod.DELETE, "/api/jobs/post/**").hasAnyRole("ADMIN", "RECRUITER")
                .requestMatchers(HttpMethod.POST, "/api/jobs/*/apply").hasAnyRole("USER")
                .requestMatchers(HttpMethod.GET, "/api/jobs/applied").hasAnyRole("USER")

                .requestMatchers(HttpMethod.GET, "/api/jobs/load").hasRole("ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/resumes/upload").authenticated()
                .requestMatchers(HttpMethod.GET,  "/api/resumes/my-summary").authenticated()
                .requestMatchers(HttpMethod.GET,  "/api/resumes/jobs/*/candidates")
                    .hasAnyRole("ADMIN", "RECRUITER")

                .anyRequest().authenticated()
            )
            .authenticationProvider(authProvider())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = Arrays.asList(allowedOriginsRaw.split(","));

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
