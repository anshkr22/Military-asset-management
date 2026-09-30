package com.military.assetmanagement.config;

import com.military.assetmanagement.entity.Base;
import com.military.assetmanagement.entity.Role;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.BaseRepository;
import com.military.assetmanagement.repository.RoleRepository;
import com.military.assetmanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            UserRepository userRepository,
            RoleRepository roleRepository,
            BaseRepository baseRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            Role adminRole = roleRepository.findAll()
                    .stream()
                    .filter(role -> "ADMIN".equals(role.getName()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("ADMIN role not found"));

            Role commanderRole = roleRepository.findAll()
                    .stream()
                    .filter(role -> "BASE_COMMANDER".equals(role.getName()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException(
                            "BASE_COMMANDER role not found"));

            Role logisticsRole = roleRepository.findAll()
                    .stream()
                    .filter(role -> "LOGISTICS_OFFICER".equals(role.getName()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException(
                            "LOGISTICS_OFFICER role not found"));

            Base baseAlpha = baseRepository.findById(1)
                    .orElseThrow(() -> new IllegalStateException("Base Alpha not found"));

            Base baseBravo = baseRepository.findById(2)
                    .orElseThrow(() -> new IllegalStateException("Base Bravo not found"));

            // Admin user
            if (userRepository.findByUsername("admin").isEmpty()) {

                User admin = new User();

                admin.setUsername("admin");
                admin.setFullName("System Administrator");
                admin.setPasswordHash(
                        passwordEncoder.encode("Admin@123"));
                admin.setRole(adminRole);
                admin.setBase(null);

                userRepository.save(admin);

                System.out.println("Admin user created.");
            }

            // Base Commander
            if (userRepository.findByUsername("commander1").isEmpty()) {

                User commander = new User();

                commander.setUsername("commander1");
                commander.setFullName("Alpha Base Commander");
                commander.setPasswordHash(
                        passwordEncoder.encode("Commander@123"));
                commander.setRole(commanderRole);
                commander.setBase(baseAlpha);

                userRepository.save(commander);

                System.out.println("Commander user created.");
            }

            // Logistics Officer
            if (userRepository.findByUsername("logistics1").isEmpty()) {

                User logistics = new User();

                logistics.setUsername("logistics1");
                logistics.setFullName("Bravo Logistics Officer");
                logistics.setPasswordHash(
                        passwordEncoder.encode("Logistics@123"));
                logistics.setRole(logisticsRole);
                logistics.setBase(baseBravo);

                userRepository.save(logistics);

                System.out.println("Logistics user created.");
            }
        };
    }
}