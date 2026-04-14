package com.aman.springboot.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobPost job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", referencedColumnName = "email", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime appliedAt;

    private String mobile;
    private String location;
    private String noticePeriod;
    private String currentCtc;
    private String expectedCtc;

    @Column(columnDefinition = "TEXT")
    private String profileImageBase64;

    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
    }

    public JobApplication() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public JobPost getJob() { return job; }
    public void setJob(JobPost job) { this.job = job; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getNoticePeriod() { return noticePeriod; }
    public void setNoticePeriod(String noticePeriod) { this.noticePeriod = noticePeriod; }
    public String getCurrentCtc() { return currentCtc; }
    public void setCurrentCtc(String currentCtc) { this.currentCtc = currentCtc; }
    public String getExpectedCtc() { return expectedCtc; }
    public void setExpectedCtc(String expectedCtc) { this.expectedCtc = expectedCtc; }
    public String getProfileImageBase64() { return profileImageBase64; }
    public void setProfileImageBase64(String profileImageBase64) { this.profileImageBase64 = profileImageBase64; }
}
