package com.aman.springboot.controller;

import com.aman.springboot.model.JobApplication;
import com.aman.springboot.model.JobPost;
import com.aman.springboot.model.User;
import com.aman.springboot.repo.JobApplicationRepo;
import com.aman.springboot.service.JobService;
import com.aman.springboot.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
public class JobApplicationController {

    @Autowired private JobApplicationRepo jobApplicationRepo;
    @Autowired private JobService jobService;
    @Autowired private UserService userService;

    @PostMapping("/{jobId}/apply")
    @CacheEvict(value = "candidateMatches", key = "#jobId")
    public ResponseEntity<?> applyToJob(@PathVariable Integer jobId, @RequestBody(required = false) com.aman.springboot.model.JobApplication reqData) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(auth.getName());
        
        if (user == null) {
            return ResponseEntity.badRequest().body("{\"error\": \"User not found\"}");
        }
        
        JobPost job = jobService.getJob(jobId);
        if (job == null || job.getPostId() == null) {
            return ResponseEntity.notFound().build();
        }

        if (jobApplicationRepo.existsByJobPostIdAndUserEmail(jobId, user.getEmail())) {
            return ResponseEntity.badRequest().body("{\"error\": \"Already applied to this job\"}");
        }

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setUser(user);
        
        if (reqData != null) {
            application.setMobile(reqData.getMobile());
            application.setLocation(reqData.getLocation());
            application.setNoticePeriod(reqData.getNoticePeriod());
            application.setCurrentCtc(reqData.getCurrentCtc());
            application.setExpectedCtc(reqData.getExpectedCtc());
            application.setProfileImageBase64(reqData.getProfileImageBase64());
        }
        
        jobApplicationRepo.save(application);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/applied")
    public ResponseEntity<List<Integer>> getAppliedJobs() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<JobApplication> apps = jobApplicationRepo.findByUserEmail(auth.getName());
        List<Integer> appliedJobIds = apps.stream()
                .map(a -> a.getJob().getPostId())
                .collect(Collectors.<Integer>toList());
        return ResponseEntity.ok(appliedJobIds);
    }
}
