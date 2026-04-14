package com.aman.springboot.dto;

public class ResumeUploadResponse {
    private Long resumeId;
    private String fileName;
    private String aiSummary;
    private String extractedSkills;
    private String experience;
    private String education;
    private String parsedText;
    private String message;
    private boolean success;

    public ResumeUploadResponse() {}

    public ResumeUploadResponse(Long resumeId, String fileName, String aiSummary, String extractedSkills, String experience, String education, String parsedText, String message, boolean success) {
        this.resumeId = resumeId;
        this.fileName = fileName;
        this.aiSummary = aiSummary;
        this.extractedSkills = extractedSkills;
        this.experience = experience;
        this.education = education;
        this.parsedText = parsedText;
        this.message = message;
        this.success = success;
    }
    
    // Manual getters and setters
    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
    
    public String getExtractedSkills() { return extractedSkills; }
    public void setExtractedSkills(String extractedSkills) { this.extractedSkills = extractedSkills; }
    
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    
    public String getParsedText() { return parsedText; }
    public void setParsedText(String parsedText) { this.parsedText = parsedText; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
} 