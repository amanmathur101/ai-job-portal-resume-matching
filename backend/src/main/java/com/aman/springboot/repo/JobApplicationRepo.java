package com.aman.springboot.repo;

import com.aman.springboot.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepo extends JpaRepository<JobApplication, Long> {
    boolean existsByJobPostIdAndUserEmail(Integer jobId, String email);
    List<JobApplication> findByUserEmail(String email);
    List<JobApplication> findByJobPostId(Integer jobId);
}
