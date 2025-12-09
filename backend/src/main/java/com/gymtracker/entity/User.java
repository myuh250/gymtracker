package com.gymtracker.entity;

import java.util.ArrayList;
import java.util.List;

import com.gymtracker.enums.Role;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * User Entity representing a user in the Gym Tracker system
 * Contains authentication information and profile data
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(name = "password_hash")
    private String passwordHash;
    
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role = Role.ROLE_USER;
    
    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;
    
    @Column(name = "is_oauth", nullable = false)
    private Boolean isOauth = false;
    
    @Column(name = "oauth_provider", length = 50)
    private String oauthProvider;
    
    @Column(name = "oauth_id")
    private String oauthId;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "refresh_token", length = 500)
    private String refreshToken;
    
    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutLog> workoutLogs = new ArrayList<>();
    
    // Helper methods for bidirectional relationship
    public void addWorkoutLog(WorkoutLog workoutLog) {
        workoutLogs.add(workoutLog);
        workoutLog.setUser(this);
    }
    
    public void removeWorkoutLog(WorkoutLog workoutLog) {
        workoutLogs.remove(workoutLog);
        workoutLog.setUser(null);
    }
}

