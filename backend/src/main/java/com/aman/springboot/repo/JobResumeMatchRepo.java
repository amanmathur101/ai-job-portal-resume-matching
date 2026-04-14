package com.aman.springboot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.aman.springboot.model.JobResumeMatch;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobResumeMatchRepo extends JpaRepository<JobResumeMatch, Long> {
    
    @Query("SELECT jrm FROM JobResumeMatch jrm WHERE jrm.job.postId = :jobId ORDER BY jrm.matchScore DESC")
    List<JobResumeMatch> findByJobIdOrderByMatchScoreDesc(@Param("jobId") Integer jobId);
    
    Optional<JobResumeMatch> findByJobPostIdAndResumeId(Integer jobId, Long resumeId);
    
    @Query("SELECT jrm FROM JobResumeMatch jrm WHERE jrm.resume.id = :resumeId ORDER BY jrm.matchScore DESC")
    List<JobResumeMatch> findByResumeIdOrderByMatchScoreDesc(@Param("resumeId") Long resumeId);
} 