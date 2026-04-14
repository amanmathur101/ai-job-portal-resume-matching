package com.aman.springboot.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.aman.springboot.dto.CandidateMatchResponse;
import com.aman.springboot.dto.ResumeUploadResponse;
import com.aman.springboot.model.JobPost;
import com.aman.springboot.model.Resume;
import com.aman.springboot.model.User;
import com.aman.springboot.service.JobMatchingService;
import com.aman.springboot.service.JobService;
import com.aman.springboot.service.ResumeParsingService;
import com.aman.springboot.service.UserService;

import java.util.List;
import java.util.Set;
import java.util.Optional;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.net.MalformedURLException;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.aman.springboot.repo.ResumeRepo;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ResumeController.class);

    private static final long MAX_FILE_BYTES = 5 * 1024 * 1024L; // 5 MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    );

    @Autowired private ResumeParsingService resumeParsingService;
    @Autowired private JobMatchingService jobMatchingService;
    @Autowired private JobService jobService;
    @Autowired private UserService userService;
    @Autowired private ResumeRepo resumeRepo;

  
    @PostMapping("/upload")
    public ResponseEntity<ResumeUploadResponse> uploadResume(@RequestParam("file") MultipartFile file) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(authentication.getName());

        if (user == null) {
            return badRequest("Authenticated user not found.");
        }

        if (file.isEmpty()) {
            return badRequest("Please select a file to upload.");
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            return badRequest("File size must not exceed 5 MB.");
        }


        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            return badRequest("Only PDF and DOCX files are supported.");
        }

        try {
            ResumeUploadResponse response = resumeParsingService.parseAndSaveResume(file, user);
            return response.isSuccess()
                ? ResponseEntity.status(HttpStatus.CREATED).body(response)
                : ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error uploading resume: ", e);
            return serverError("Error processing resume: " + e.getMessage());
        }
    }


    @GetMapping("/jobs/{jobId}/candidates")
    public ResponseEntity<List<CandidateMatchResponse>> getCandidatesForJob(@PathVariable Integer jobId) {
        JobPost job = jobService.getJob(jobId);
        if (job == null || job.getPostId() == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(jobMatchingService.getRankedCandidatesForJob(jobId, job));
    }

    @GetMapping("/my-summary")
    public ResponseEntity<ResumeUploadResponse> getMyResumeSummary() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        User user = userService.findByEmail(authentication.getName());

        if (user == null) {
            return badRequest("Authenticated user not found.");
        }

        Resume latest = resumeParsingService.getLatestResumeByUser(user);

        if (latest == null) {
            ResumeUploadResponse noResume = new ResumeUploadResponse();
            noResume.setMessage("No resume uploaded yet.");
            noResume.setSuccess(false);
            return ResponseEntity.ok(noResume);
        }

        ResumeUploadResponse response = new ResumeUploadResponse();
        response.setResumeId(latest.getId());
        response.setFileName(latest.getFileName());
        response.setAiSummary(latest.getAiSummary());
        response.setExtractedSkills(latest.getExtractedSkills());
        response.setExperience(latest.getExperience());
        response.setEducation(latest.getEducation());
        response.setParsedText(latest.getParsedText());
        response.setMessage("Resume summary retrieved successfully.");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{resumeId}/download")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long resumeId) {
        Optional<Resume> optionalResume = resumeRepo.findById(resumeId);
        if (optionalResume.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Resume resume = optionalResume.get();
        Path filePath = Paths.get(resume.getFilePath()).normalize();
        
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            String contentType = "application/octet-stream";
            if (resume.getFileName().toLowerCase().endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (resume.getFileName().toLowerCase().endsWith(".docx")) {
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            } else if (resume.getFileName().toLowerCase().endsWith(".txt")) {
                contentType = "text/plain";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resume.getFileName() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            log.error("Error creating URL for resume file", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private ResponseEntity<ResumeUploadResponse> badRequest(String message) {
        ResumeUploadResponse r = new ResumeUploadResponse();
        r.setMessage(message);
        r.setSuccess(false);
        return ResponseEntity.badRequest().body(r);
    }

    private ResponseEntity<ResumeUploadResponse> serverError(String message) {
        ResumeUploadResponse r = new ResumeUploadResponse();
        r.setMessage(message);
        r.setSuccess(false);
        return ResponseEntity.internalServerError().body(r);
    }
}
