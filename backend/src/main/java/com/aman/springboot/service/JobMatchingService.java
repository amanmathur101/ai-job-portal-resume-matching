package com.aman.springboot.service;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.aman.springboot.model.JobApplication;
import com.aman.springboot.repo.JobApplicationRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aman.springboot.dto.CandidateMatchResponse;
import com.aman.springboot.model.JobPost;
import com.aman.springboot.model.JobResumeMatch;
import com.aman.springboot.model.Resume;
import com.aman.springboot.repo.JobResumeMatchRepo;
import com.aman.springboot.repo.ResumeRepo;

@Service
public class JobMatchingService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(JobMatchingService.class);

    @Autowired private ResumeRepo resumeRepo;
    @Autowired private JobResumeMatchRepo jobResumeMatchRepo;
    @Autowired private JobApplicationRepo jobApplicationRepo;
    @Autowired private MockAiService mockAiService;
    
    @Cacheable(value = "candidateMatches", key = "#jobId")
    @Transactional
    public List<CandidateMatchResponse> getRankedCandidatesForJob(Integer jobId, JobPost job) {
        log.info("Computing candidate ranking for jobId={} (cache miss)", jobId);

        List<JobApplication> applications = jobApplicationRepo.findByJobPostId(jobId);
        List<String> applicantEmails = applications.stream()
                .map(app -> app.getUser().getEmail())
                .collect(Collectors.toList());

        List<Resume> allResumes = resumeRepo.findAll().stream()
                .filter(r -> applicantEmails.contains(r.getUser().getEmail()))
                .collect(Collectors.toList());

        for (Resume resume : allResumes) {
            Optional<JobResumeMatch> existing =
                jobResumeMatchRepo.findByJobPostIdAndResumeId(jobId, resume.getId());

            if (existing.isEmpty()) {
                JobResumeMatch match = computeMatch(job, resume);
                jobResumeMatchRepo.save(match);
            }
        }

        return jobResumeMatchRepo.findByJobIdOrderByMatchScoreDesc(jobId)
                .stream()
                .map(match -> toResponse(match, applications))
                .collect(Collectors.toList());
    }


    @CacheEvict(value = "candidateMatches", allEntries = true)
    public void evictCandidateCache() {
        log.debug("Candidate match cache evicted (new resume uploaded)");
    }

    @NonNull
    private JobResumeMatch computeMatch(JobPost job, Resume resume) {
        try {
            String techStack = job.getPostTechStack() != null
                ? String.join(", ", job.getPostTechStack()) : "";

            MockAiService.MatchResult result = mockAiService.calculateMatchScore(
                job.getPostProfile(),
                job.getPostDesc(),
                techStack,
                resume.getExtractedSkills(),
                resume.getExperience()
            );

            JobResumeMatch m = new JobResumeMatch();
            m.setJob(job);
            m.setResume(resume);
            m.setMatchScore(result.getScore());
            m.setMatchReason(result.getReason());
            return m;

        } catch (Exception e) {
            log.error("Match score calculation failed for resume {}: ", resume.getId(), e);
            JobResumeMatch fallback = new JobResumeMatch();
            fallback.setJob(job);
            fallback.setResume(resume);
            fallback.setMatchScore(0.0);
            fallback.setMatchReason("Score unavailable — calculation error");
            return fallback;
        }
    }

    private CandidateMatchResponse toResponse(JobResumeMatch match, List<JobApplication> applications) {
        Resume r = match.getResume();
        CandidateMatchResponse resp = new CandidateMatchResponse(
            r.getId(),
            r.getUser().getUsername(),
            r.getUser().getEmail(),
            r.getAiSummary(),
            r.getExtractedSkills(),
            match.getMatchScore(),
            match.getMatchReason(),
            r.getFileName()
        );
        
        applications.stream()
            .filter(a -> a.getUser().getEmail().equals(r.getUser().getEmail()))
            .findFirst()
            .ifPresent(a -> {
                resp.setMobile(a.getMobile());
                resp.setLocation(a.getLocation());
                resp.setNoticePeriod(a.getNoticePeriod());
                resp.setCurrentCtc(a.getCurrentCtc());
                resp.setExpectedCtc(a.getExpectedCtc());
                resp.setCandidateImageUrl(a.getProfileImageBase64());
            });
            
        return resp;
    }
}
