package com.aman.springboot.dto;

public class CandidateMatchResponse {
    private Long resumeId;
    private String candidateName;
    private String candidateEmail;
    private String aiSummary;
    private String extractedSkills;
    private Double matchScore;
    private String matchReason;
    private String resumeFileName;
    private String mobile;
    private String location;
    private String noticePeriod;
    private String currentCtc;
    private String expectedCtc;
    private String candidateImageUrl;

    public CandidateMatchResponse() {}

    public CandidateMatchResponse(Long resumeId, String candidateName, String candidateEmail, String aiSummary, String extractedSkills, Double matchScore, String matchReason, String resumeFileName) {
        this.resumeId = resumeId;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        this.aiSummary = aiSummary;
        this.extractedSkills = extractedSkills;
        this.matchScore = matchScore;
        this.matchReason = matchReason;
        this.resumeFileName = resumeFileName;
    }

    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }
    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }
    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
    public String getExtractedSkills() { return extractedSkills; }
    public void setExtractedSkills(String extractedSkills) { this.extractedSkills = extractedSkills; }
    public Double getMatchScore() { return matchScore; }
    public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }
    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }
    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getNoticePeriod() { return noticePeriod; }
    public void setNoticePeriod(String noticePeriod) { this.noticePeriod = noticePeriod; }
    public String getCurrentCtc() { return currentCtc; }
    public void setCurrentCtc(String currentCtc) { this.currentCtc = currentCtc; }
    public String getExpectedCtc() { return expectedCtc; }
    public void setExpectedCtc(String expectedCtc) { this.expectedCtc = expectedCtc; }
    public String getCandidateImageUrl() { return candidateImageUrl; }
    public void setCandidateImageUrl(String candidateImageUrl) { this.candidateImageUrl = candidateImageUrl; }
} 