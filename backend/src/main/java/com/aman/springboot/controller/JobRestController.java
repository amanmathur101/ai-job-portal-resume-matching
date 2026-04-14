package com.aman.springboot.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import com.aman.springboot.model.JobPost;
import com.aman.springboot.service.JobService;


@RequestMapping("/api/jobs")
@RestController
public class JobRestController {

    @Autowired
    private JobService service;

    @GetMapping("/all")
    public List<JobPost> getAllJobs() {
        return service.getAllJobs();
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<JobPost> getJob(@PathVariable int postId) {
        JobPost job = service.getJob(postId);
        if (job == null || job.getPostId() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(job);
    }

    @PostMapping("/post")
    public ResponseEntity<JobPost> addJob(@RequestBody @NonNull JobPost jobPost) {
        JobPost savedJob = service.addJob(jobPost);
        return ResponseEntity.status(201).body(savedJob);
    }

    @PutMapping("/post")
    public ResponseEntity<JobPost> updateJob(@RequestBody @NonNull JobPost jobPost) {
        if (jobPost.getPostId() == null) {
            return ResponseEntity.badRequest().build();
        }
        JobPost existing = service.getJob(jobPost.getPostId());
        if (existing == null || existing.getPostId() == null) {
            return ResponseEntity.notFound().build();
        }
        service.updateJob(jobPost);
        return ResponseEntity.ok(service.getJob(jobPost.getPostId()));
    }

    @DeleteMapping("/post/{postId}")
    public ResponseEntity<Void> deleteJob(@PathVariable int postId) {
        JobPost existing = service.getJob(postId);
        if (existing == null || existing.getPostId() == null) {
            return ResponseEntity.notFound().build();
        }
        service.deleteJob(postId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/load")
    public ResponseEntity<String> loadData() {
        service.load();
        return ResponseEntity.ok("Sample data loaded successfully.");
    }
}
