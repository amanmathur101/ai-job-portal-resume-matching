package com.aman.springboot.service;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aman.springboot.dto.ResumeUploadResponse;
import com.aman.springboot.model.Resume;
import com.aman.springboot.model.User;
import com.aman.springboot.repo.ResumeRepo;


@Service
public class ResumeParsingService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ResumeParsingService.class);

    private static final String UPLOAD_DIR = "uploads/resumes/";

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    );

    private final Tika tika = new Tika();

    @Autowired private ResumeRepo resumeRepo;
    @Autowired private MockAiService mockAiService;
    @Autowired private JobMatchingService jobMatchingService;

    public ResumeUploadResponse parseAndSaveResume(MultipartFile file, User user) {
        try {
            createUploadDirectory();

            String originalFilename = file.getOriginalFilename();
            String ext              = getFileExtension(originalFilename);
            String uniqueFilename   = UUID.randomUUID() + ext;
            Path   filePath         = Paths.get(UPLOAD_DIR + uniqueFilename);

            Files.copy(file.getInputStream(), filePath);
            String detectedType = tika.detect(filePath.toFile());
            if (!ALLOWED_MIME_TYPES.contains(detectedType)) {
                Files.deleteIfExists(filePath); 
                ResumeUploadResponse err = new ResumeUploadResponse();
                err.setMessage("Unsupported file type detected: " + detectedType
                               + ". Only PDF and DOCX are accepted.");
                err.setSuccess(false);
                return err;
            }

            String extractedText = extractText(filePath.toFile());
            MockAiService.ResumeParsingResult parsed = mockAiService.parseResume(extractedText);

            Resume resume = new Resume();
            resume.setUser(user);
            resume.setFileName(originalFilename);
            resume.setFilePath(filePath.toString());
            resume.setParsedText(extractedText);
            resume.setAiSummary(parsed.getSummary());
            resume.setExtractedSkills(parsed.getSkills());
            resume.setExperience(parsed.getExperience());
            resume.setEducation(parsed.getEducation());

            Resume saved = resumeRepo.save(resume);

            jobMatchingService.evictCandidateCache();

            ResumeUploadResponse response = new ResumeUploadResponse();
            response.setResumeId(saved.getId());
            response.setFileName(originalFilename);
            response.setAiSummary(parsed.getSummary());
            response.setExtractedSkills(parsed.getSkills());
            response.setExperience(parsed.getExperience());
            response.setEducation(parsed.getEducation());
            response.setParsedText(extractedText);
            response.setMessage("Resume uploaded and parsed successfully.");
            response.setSuccess(true);
            return response;

        } catch (IOException | TikaException e) {
            log.error("Error parsing resume for user {}: ", user.getEmail(), e);
            ResumeUploadResponse err = new ResumeUploadResponse();
            err.setMessage("Error reading or parsing resume file: " + e.getMessage());
            err.setSuccess(false);
            return err;
        } catch (RuntimeException e) {
            log.error("Unexpected system error while parsing resume for user {}: ", user.getEmail(), e);
            ResumeUploadResponse err = new ResumeUploadResponse();
            err.setMessage("An unexpected system error occurred: " + e.getMessage());
            err.setSuccess(false);
            return err;
        }
    }

    public Resume getLatestResumeByUser(User user) {
        return resumeRepo.findTopByUserOrderByUploadedAtDesc(user).orElse(null);
    }

    private void createUploadDirectory() throws IOException {
        Path dir = Paths.get(UPLOAD_DIR);
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.'));
    }

    private String extractText(File file) throws IOException, TikaException {
        return tika.parseToString(file);
    }
}
