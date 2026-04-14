package com.aman.springboot.service;


import org.springframework.stereotype.Service;


@Service
public class MockAiService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MockAiService.class);

    public ResumeParsingResult parseResume(String resumeText) {
        log.debug("Parsing resume text ({} chars)", resumeText.length());

        return new ResumeParsingResult(
            generateSummary(resumeText),
            extractSkills(resumeText),
            extractExperience(resumeText),
            extractEducation(resumeText)
        );
    }

    public MatchResult calculateMatchScore(String jobProfile,
                                           String jobDescription,
                                           String jobTechStack,
                                           String candidateSkills,
                                           String candidateExperience) {
        log.debug("Calculating match score for job: {}", jobProfile);

   
        double score = computeScore(jobProfile, jobDescription, jobTechStack,
                                    candidateSkills, candidateExperience);
        return new MatchResult(score, describeScore(score));
    }



    private String generateSummary(String text) {
        String lower = text.toLowerCase();
        StringBuilder sb = new StringBuilder();

        if (lower.contains("senior") || lower.contains("lead") || lower.contains("manager")) {
            sb.append("Senior-level professional ");
        } else if (lower.contains("junior") || lower.contains("entry") || lower.contains("graduate")) {
            sb.append("Entry-level professional ");
        } else {
            sb.append("Experienced professional ");
        }

        if (lower.contains("developer") || lower.contains("programmer")) {
            sb.append("with software development expertise. ");
        } else if (lower.contains("engineer")) {
            sb.append("with engineering background. ");
        } else if (lower.contains("analyst")) {
            sb.append("with analytical skills. ");
        } else {
            sb.append("with technical expertise. ");
        }

        if (lower.contains("years") || lower.contains("worked") || lower.contains("experience")) {
            sb.append("Has practical hands-on experience in the field.");
        }

        return sb.toString().trim();
    }

    private String extractSkills(String text) {
        String lower = text.toLowerCase();
        StringBuilder skills = new StringBuilder();

        String[][] categories = {
            {"Java",        "java", "spring", "hibernate", "maven", "gradle"},
            {"JavaScript",  "javascript", "react", "angular", "vue", "node", "typescript"},
            {"Python",      "python", "django", "flask", "pandas", "numpy"},
            {"SQL",         "sql", "mysql", "postgresql", "oracle", "database"},
            {"HTML/CSS",    "html", "css", "bootstrap", "tailwind"},
            {"Docker",      "docker", "kubernetes", "container", "devops", "ci/cd"},
            {"Git",         "git", "github", "gitlab"},
            {"Cloud",       "aws", "azure", "gcp", "cloud"}
        };

        for (String[] category : categories) {
            for (int i = 1; i < category.length; i++) {
                if (lower.contains(category[i])) {
                    if (skills.length() > 0) skills.append(", ");
                    skills.append(category[0]);
                    break;
                }
            }
        }

        return skills.length() > 0 ? skills.toString()
                                    : "General programming, Problem solving, Team collaboration";
    }

    private String extractExperience(String text) {
        String lower = text.toLowerCase();
        for (String line : text.split("\n")) {
            String ll = line.toLowerCase();
            if ((ll.contains("experience") || ll.contains("worked") || ll.contains("years"))
                    && line.trim().length() > 10 && line.trim().length() < 200) {
                return line.trim().replaceAll("\\s+", " ");
            }
        }
        if (lower.contains("senior") || lower.contains("lead")) return "5+ years of professional experience";
        if (lower.contains("junior") || lower.contains("entry"))  return "1–2 years of experience";
        return "3+ years of relevant experience";
    }

    private String extractEducation(String text) {
        String lower = text.toLowerCase();
        for (String line : text.split("\n")) {
            String ll = line.toLowerCase();
            if ((ll.contains("education") || ll.contains("degree") || ll.contains("university")
                    || ll.contains("bachelor") || ll.contains("master") || ll.contains("college"))
                    && line.trim().length() > 10 && line.trim().length() < 200) {
                return line.trim().replaceAll("\\s+", " ");
            }
        }
        if (lower.contains("master") || lower.contains("phd")) return "Advanced degree in relevant field";
        if (lower.contains("bachelor") || lower.contains("degree")) return "Bachelor's degree in Computer Science or related field";
        return "Educational background in technology or related field";
    }

    private double computeScore(String jobProfile, String jobDesc, String techStack,
                                 String candidateSkills, String candidateExperience) {
        double score = 0.3; 

        if (candidateSkills == null) candidateSkills = "";
        if (techStack       == null) techStack       = "";

       
        String[] required = techStack.toLowerCase().split("[,\\s]+");
        String[] candidate = candidateSkills.toLowerCase().split("[,\\s]+");
        int matches = 0;
        for (String req : required) {
            for (String skill : candidate) {
                if (!req.isBlank() && !skill.isBlank()
                        && (skill.contains(req) || req.contains(skill))) {
                    matches++;
                    break;
                }
            }
        }
        if (required.length > 0) {
            score += 0.5 * ((double) matches / required.length);
        }

   
        if (jobDesc.toLowerCase().contains("senior") && candidateExperience.contains("5+")) {
            score += 0.1;
        }
        if (jobProfile.toLowerCase().contains("developer")
                && candidateSkills.toLowerCase().contains("java")) {
            score += 0.1;
        }

        return Math.min(score, 1.0);
    }

    private String describeScore(double score) {
        if (score >= 0.80) return "Excellent match: strong skill alignment and relevant experience";
        if (score >= 0.60) return "Good match: candidate has relevant skills and experience";
        if (score >= 0.40) return "Moderate match: some relevant skills; may need targeted upskilling";
        return "Limited match: candidate profile does not closely align with this role";
    }



    public static class ResumeParsingResult {
        private final String summary;
        private final String skills;
        private final String experience;
        private final String education;

        public ResumeParsingResult(String summary, String skills, String experience, String education) {
            this.summary = summary; this.skills = skills;
            this.experience = experience; this.education = education;
        }

        public String getSummary()    { return summary; }
        public String getSkills()     { return skills; }
        public String getExperience() { return experience; }
        public String getEducation()  { return education; }
    }

    public static class MatchResult {
        private final double score;
        private final String reason;

        public MatchResult(double score, String reason) {
            this.score = score; this.reason = reason;
        }

        public double getScore()  { return score; }
        public String getReason() { return reason; }
    }
}
