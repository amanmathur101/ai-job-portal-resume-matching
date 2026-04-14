package com.aman.springboot.service;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.aman.springboot.model.JobPost;
import com.aman.springboot.repo.JobRepo;
import com.aman.springboot.repo.JobResumeMatchRepo;
import com.aman.springboot.model.JobResumeMatch;

@Service
public class JobService {
    @Autowired
    public JobRepo repo;

    @Autowired
    private JobResumeMatchRepo jobResumeMatchRepo;
    public List<JobPost> getAllJobs() {
        return repo.findAll();
    }
    public JobPost addJob(@NonNull JobPost jobPost) {
        return repo.save(jobPost);
    }
    public JobPost getJob(int postId) {
        return repo.findById(postId).orElse(null);
    }
    public void updateJob(@NonNull JobPost jobPost) {
        Integer postId = jobPost.getPostId();
        if (postId == null) return;
        
        JobPost existing = repo.findById(postId).orElse(null);
        if (existing != null) {
            if (jobPost.getPostProfile() != null) existing.setPostProfile(jobPost.getPostProfile());
            if (jobPost.getPostDesc() != null) existing.setPostDesc(jobPost.getPostDesc());
            if (jobPost.getReqExperience() != null) existing.setReqExperience(jobPost.getReqExperience());
            if (jobPost.getPostTechStack() != null) existing.setPostTechStack(jobPost.getPostTechStack());
            repo.save(existing);
        } else {
            repo.save(jobPost);
        }
    }
    public void deleteJob(int postId) {
        List<JobResumeMatch> matches = jobResumeMatchRepo.findByJobIdOrderByMatchScoreDesc(postId);
        if (matches != null) {
            for (JobResumeMatch match : matches) {
                if (match != null) {
                    jobResumeMatchRepo.delete(match);
                }
            }
        }
        repo.deleteById(postId);
    }
    public void load() {
        List<JobPost> jobs =
                new ArrayList<>(List.of(
                        new JobPost(null, "Software Engineer", "Exciting opportunity for a skilled software engineer.", 3, List.of("Java", "Spring", "SQL")),
                        new JobPost(null, "Data Scientist", "Join our data science team and work on cutting-edge projects.", 5, List.of("Python", "Machine Learning", "TensorFlow")),
                        new JobPost(null, "Frontend Developer", "Create amazing user interfaces with our talented frontend team.", 2, List.of("JavaScript", "React", "CSS")),
                        new JobPost(null, "Network Engineer", "Design and maintain our robust network infrastructure.", 4, List.of("Cisco", "Routing", "Firewalls")),
                        new JobPost(null, "UX Designer", "Shape the user experience with your creative design skills.", 3, List.of("UI/UX Design", "Adobe XD", "Prototyping"))
                ));
        repo.saveAll(jobs);
    }
    public List<JobPost> search(String keyword) {

        return repo.findByPostProfileContainingOrPostDescContaining(keyword,keyword);
    }
}