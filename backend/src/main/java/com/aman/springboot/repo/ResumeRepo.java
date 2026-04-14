package com.aman.springboot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.aman.springboot.model.Resume;
import com.aman.springboot.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepo extends JpaRepository<Resume, Long> {
    
    List<Resume> findByUserEmail(String userEmail);
    
    @Query("SELECT r FROM Resume r WHERE r.user.email = :userEmail ORDER BY r.lastUpdated DESC")
    List<Resume> findLatestResumesByUserEmail(@Param("userEmail") String userEmail);
    
    Optional<Resume> findTopByUserOrderByUploadedAtDesc(User user);

} 