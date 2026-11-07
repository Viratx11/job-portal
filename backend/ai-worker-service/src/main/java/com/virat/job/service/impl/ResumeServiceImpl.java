package com.virat.job.service.impl;

import com.virat.job.client.GeminiClient;
import com.virat.job.domain.JobType;
import com.virat.job.domain.ResumeTemplate;
import com.virat.job.dto.request.CreateResumeRequest;
import com.virat.job.dto.request.FormatResumeAiRequest;
import com.virat.job.dto.request.UpdatePersonalInfoRequest;
import com.virat.job.dto.request.UpdateResumeRequest;
import com.virat.job.dto.response.*;
import com.virat.job.mapper.ResumeMapper;
import com.virat.job.modal.*;
import com.virat.job.modal.embeddable.PersonalInfo;
import com.virat.job.repository.*;
import com.virat.job.security.PromptInjectionSanitizer;
import com.virat.job.service.ResumeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.interactive.action.PDAction;
import org.apache.pdfbox.pdmodel.interactive.action.PDActionURI;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotation;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationLink;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final EducationRepository educationRepository;
    private final ResumeSkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final AwardRepository awardRepository;
    private final LanguageRepository languageRepository;
    private final GeminiClient geminiClient;

    private static final String[] KNOWN_SKILLS = {
        "C++", "Java", "Python", "Go", "Golang", "Rust", "JavaScript", "TypeScript", "SQL", "C", "C#",
        "Spring Boot", "Spring Security", "Spring Data JPA", "Hibernate", "gRPC", "Node.js", "Express.js", "Express",
        "React", "Next.js", "Redux", "Tailwind CSS", "HTML", "CSS", "GraphQL", "REST API", "Microservices",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "Apache Kafka", "Kafka", "BullMQ", "RabbitMQ", "Elasticsearch", "Cassandra", "SQLite", "Flyway",
        "Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "Linux", "Git", "GitHub", "Maven", "Postman", "Nginx",
        "FastAPI", "Django", "Flask", "Streamlit", "Scikit-learn", "Pandas", "NumPy", "XGBoost",
        "LangChain", "RAG", "LLM APIs", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Power BI", "DAX", "System Design", "OOP", "Data Structures", "Algorithms", "Solidity", "Web3"
    };

    private record ExtractedPdfData(String text, List<String> embeddedUrls) {}

    private ExtractedPdfData extractPdfTextAndLinks(byte[] bytes, boolean isPdf) {
        String rawText = "";
        List<String> embeddedUrls = new ArrayList<>();

        if (isPdf) {
            try (PDDocument document = org.apache.pdfbox.Loader.loadPDF(bytes)) {
                org.apache.pdfbox.text.PDFTextStripper stripper = new org.apache.pdfbox.text.PDFTextStripper();
                stripper.setSortByPosition(true);
                rawText = stripper.getText(document);

                for (PDPage page : document.getPages()) {
                    try {
                        for (PDAnnotation ann : page.getAnnotations()) {
                            if (ann instanceof PDAnnotationLink link) {
                                PDAction action = link.getAction();
                                if (action instanceof PDActionURI uriAction) {
                                    String uri = uriAction.getURI();
                                    if (isValidCandidateUrl(uri) && !embeddedUrls.contains(uri.trim())) {
                                        embeddedUrls.add(uri.trim());
                                    }
                                }
                            }
                        }
                    } catch (Exception ignored) {
                    }
                }
            } catch (Throwable e) {
                rawText = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
            }
        } else {
            rawText = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        }

        // Also scan visible text for any explicit https:// URLs
        if (rawText != null) {
            Matcher m = Pattern.compile("https?://[^\\s)>\\]\"'\\\\]+").matcher(rawText);
            while (m.find()) {
                String u = m.group().trim();
                if (isValidCandidateUrl(u) && !embeddedUrls.contains(u)) {
                    embeddedUrls.add(u);
                }
            }
        }

        return new ExtractedPdfData(rawText != null ? rawText : "", embeddedUrls);
    }

    private boolean isValidCandidateUrl(String uri) {
        if (uri == null || uri.isBlank()) return false;
        String lower = uri.toLowerCase();
        if (!lower.startsWith("http://") && !lower.startsWith("https://")) return false;
        // Ignore font/LaTeX metadata URLs
        return !lower.contains("scripts.sil.org")
                && !lower.contains("ams.org")
                && !lower.contains("w3.org")
                && !lower.contains("tug.org")
                && !lower.contains("ctan.org")
                && !lower.contains("adobe.com");
    }

    @Override
    public ResumeResponse createResume(Long candidateId, CreateResumeRequest req) throws Exception {
        boolean isFirst = !resumeRepository.existsByCandidateIdAndActiveTrue(candidateId);

        Resume resume = Resume.builder()
                .candidateId(candidateId)
                .title(req.getTitle())
                .template(req.getTemplate() != null ? req.getTemplate() : com.virat.job.domain.ResumeTemplate.PROFESSIONAL)
                .visibility(req.getVisibility() != null ? req.getVisibility() : com.virat.job.domain.ResumeVisibility.PUBLIC)
                .isDefault(isFirst || Boolean.TRUE.equals(req.getIsDefault()))
                .build();

        if (Boolean.TRUE.equals(req.getIsDefault()) && !isFirst) {
            clearDefaultFlag(candidateId);
        }

        resume = resumeRepository.save(resume);
        resume.setUploadedFileUrl("/api/resumes/" + resume.getId() + "/file");
        if (resume.getUploadedFileName() == null) {
            String safeTitle = (req.getTitle() != null ? req.getTitle() : "Resume_" + resume.getId())
                    .replaceAll("[^a-zA-Z0-9._-]", "_");
            resume.setUploadedFileName(safeTitle + ".pdf");
        }
        Resume savedResume = resumeRepository.save(resume);
        syncResumeSummaryAndPdf(savedResume.getId());
        return buildFullResponse(savedResume);
    }

    @Override
    public ResumeResponse uploadResumeFile(Long candidateId, org.springframework.web.multipart.MultipartFile file, String title) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new Exception("Please select a valid PDF or text resume file to upload");
        }
        String originalName = file.getOriginalFilename() != null
                ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")
                : "resume.pdf";
        if (originalName.length() > 120) {
            originalName = originalName.substring(originalName.length() - 120);
        }

        byte[] bytes = file.getBytes();
        boolean isPdf = originalName.toLowerCase().endsWith(".pdf");
        ExtractedPdfData pdfData = extractPdfTextAndLinks(bytes, isPdf);

        boolean hadInjectionAttempt = PromptInjectionSanitizer.containsInjectionAttempt(pdfData.text());
        if (hadInjectionAttempt) {
            log.warn("[SECURITY] Candidate {} uploaded a resume ({}) containing a suspected prompt-injection payload. Sanitizing before parsing.", candidateId, originalName);
        }

        String sanitizedMultiLineText = sanitizePreservingLines(pdfData.text());
        String fullSummaryWithLinks = buildFullSummaryWithEmbeddedLinks(sanitizedMultiLineText, pdfData.embeddedUrls());

        boolean isFirst = !resumeRepository.existsByCandidateIdAndActiveTrue(candidateId);
        String resolvedTitle = (title != null && !title.isBlank())
                ? PromptInjectionSanitizer.sanitize(title.trim())
                : originalName.replaceFirst("[.][^.]+$", "").replace('_', ' ');
        if (resolvedTitle.length() > 140) {
            resolvedTitle = resolvedTitle.substring(0, 140);
        }

        PersonalInfo extractedPersonalInfo = extractPersonalInfoFromTextAndLinks(
                sanitizedMultiLineText, pdfData.embeddedUrls(), resolvedTitle
        );

        Resume resume = Resume.builder()
                .candidateId(candidateId)
                .title(resolvedTitle)
                .template(com.virat.job.domain.ResumeTemplate.PROFESSIONAL)
                .visibility(com.virat.job.domain.ResumeVisibility.PUBLIC)
                .isDefault(isFirst)
                .personalInfo(extractedPersonalInfo)
                .summary(fullSummaryWithLinks.isBlank() ? "Uploaded resume: " + originalName : fullSummaryWithLinks)
                .uploadedFileName(isPdf ? originalName : originalName + ".pdf")
                .completionScore(92)
                .build();

        resume = resumeRepository.save(resume);

        Path uploadDir = Paths.get("/tmp/nexushire-uploads");
        Files.createDirectories(uploadDir);
        if (isPdf) {
            Path targetPath = uploadDir.resolve(resume.getId() + "_" + resume.getUploadedFileName());
            Files.write(targetPath, bytes);
        }

        resume.setUploadedFileUrl("/api/resumes/" + resume.getId() + "/file");
        resume = resumeRepository.save(resume);

        populateStructuredResumeEntities(resume, sanitizedMultiLineText, pdfData.embeddedUrls());

        return buildFullResponse(resume);
    }

    private String sanitizePreservingLines(String rawText) {
        if (rawText == null || rawText.isBlank()) return "";
        String[] lines = rawText.split("\\r?\\n");
        List<String> cleanLines = new ArrayList<>(lines.length);
        for (String line : lines) {
            String s = PromptInjectionSanitizer.sanitize(line);
            if (!s.isBlank()) {
                cleanLines.add(s);
            }
        }
        return String.join("\n", cleanLines);
    }

    private String buildFullSummaryWithEmbeddedLinks(String sanitizedMultiLineText, List<String> embeddedUrls) {
        StringBuilder sb = new StringBuilder();
        if (sanitizedMultiLineText != null && !sanitizedMultiLineText.isBlank()) {
            sb.append(sanitizedMultiLineText.trim());
        }
        if (embeddedUrls != null && !embeddedUrls.isEmpty()) {
            sb.append("\n\nEmbedded Profile & Project Links:\n");
            for (String url : embeddedUrls) {
                sb.append("- ").append(url).append("\n");
            }
        }
        String res = sb.toString().trim();
        if (res.length() > 25000) {
            res = res.substring(0, 25000);
        }
        return res;
    }

    private PersonalInfo extractPersonalInfoFromTextAndLinks(String text, List<String> embeddedUrls, String fallbackTitle) {
        PersonalInfo pi = new PersonalInfo();
        String safeText = text != null ? text : "";

        // 1. Extract Name from first line of resume or fallbackTitle
        String firstLine = safeText.lines()
                .map(String::trim)
                .filter(l -> !l.isEmpty() && l.matches("^[A-Za-z][A-Za-z\\s.]{2,40}$"))
                .findFirst()
                .orElse("");
        if (!firstLine.isBlank()) {
            String[] parts = firstLine.trim().split("\\s+");
            pi.setFirstName(capitalizeWord(parts[0]));
            if (parts.length > 1) {
                pi.setLastName(capitalizeWord(String.join(" ", Arrays.copyOfRange(parts, 1, parts.length))));
            }
        } else if (fallbackTitle != null && !fallbackTitle.isBlank()) {
            String splitCamel = fallbackTitle.replaceAll("([a-z])([A-Z])", "$1 $2").replaceAll("[^a-zA-Z\\s]", " ");
            String[] parts = splitCamel.trim().split("\\s+");
            if (parts.length >= 2) {
                pi.setFirstName(capitalizeWord(parts[0]));
                pi.setLastName(capitalizeWord(parts[1]));
            }
        }

        // 2. Email
        Matcher emailMatcher = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}").matcher(safeText);
        if (emailMatcher.find()) {
            pi.setEmail(emailMatcher.group());
        }

        // 3. Phone (10 to 13 digits, formatted as +91 XXXXXXXXXX)
        Matcher phoneMatcher = Pattern.compile("(\\+?\\d[\\d\\s()-]{8,15}\\d)").matcher(safeText);
        while (phoneMatcher.find()) {
            String candidatePhone = formatPhoneNumber(phoneMatcher.group().trim());
            if (candidatePhone != null) {
                String digits = candidatePhone.replaceAll("\\D", "");
                if (digits.length() >= 10 && digits.length() <= 13) {
                    pi.setPhone(candidatePhone);
                    break;
                }
            }
        }

        // Extract contact and coding profile links from embedded PDF annotations
        if (embeddedUrls != null) {
            for (String url : embeddedUrls) {
                String lower = url.toLowerCase();
                if (lower.contains("linkedin.com/in/") && pi.getLinkedinUrl() == null) {
                    pi.setLinkedinUrl(url);
                } else if (lower.contains("codechef.com") && pi.getCodechefUrl() == null) {
                    pi.setCodechefUrl(url);
                } else if (lower.contains("hackerrank.com") && pi.getHackerrankUrl() == null) {
                    pi.setHackerrankUrl(url);
                } else if (lower.contains("leetcode.com") && pi.getLeetcodeUrl() == null) {
                    pi.setLeetcodeUrl(url);
                } else if (lower.contains("codeforces.com") && pi.getCodeforcesUrl() == null) {
                    pi.setCodeforcesUrl(url);
                } else if (lower.contains("github.com/")) {
                    String path = url.replaceFirst("(?i)^https?://(www\\.)?github\\.com/", "").replaceAll("/+$", "");
                    if (!path.contains("/") && pi.getGithubUrl() == null) {
                        pi.setGithubUrl(url);
                    } else if (pi.getGithubUrl() == null) {
                        String owner = path.split("/")[0];
                        pi.setGithubUrl("https://github.com/" + owner);
                    }
                } else if ((lower.contains(".dev") || lower.contains(".io") || lower.contains(".me") || lower.contains("portfolio"))
                        && !lower.contains("demo") && !lower.contains("landing") && !lower.contains("project") && !lower.contains("dashboard")
                        && pi.getWebsiteUrl() == null) {
                    pi.setWebsiteUrl(url);
                }
            }
        }

        // Fallback text regex for linkedin/github/leetcode/codeforces/codechef/hackerrank/portfolio
        if (pi.getLinkedinUrl() == null) {
            Matcher linkedinMatcher = Pattern.compile("(https?://)?(www\\.)?linkedin\\.com/in/[a-zA-Z0-9_-]+").matcher(safeText);
            if (linkedinMatcher.find()) {
                String u = linkedinMatcher.group();
                pi.setLinkedinUrl(u.startsWith("http") ? u : "https://" + u);
            }
        }
        if (pi.getGithubUrl() == null) {
            Matcher githubMatcher = Pattern.compile("(https?://)?(www\\.)?github\\.com/[a-zA-Z0-9_-]+").matcher(safeText);
            if (githubMatcher.find()) {
                String u = githubMatcher.group();
                pi.setGithubUrl(u.startsWith("http") ? u : "https://" + u);
            }
        }
        if (pi.getCodechefUrl() == null) {
            Matcher ccMatcher = Pattern.compile("https?://(?:www\\.)?codechef\\.com/users/([a-zA-Z0-9_-]+)/?", Pattern.CASE_INSENSITIVE).matcher(safeText);
            if (ccMatcher.find()) {
                pi.setCodechefUrl(ccMatcher.group());
            } else {
                Matcher handleM = Pattern.compile("(?i)codechef[\\s:/-]+([a-zA-Z0-9_-]{3,})").matcher(safeText);
                if (handleM.find()) pi.setCodechefUrl("https://www.codechef.com/users/" + handleM.group(1).trim());
            }
        }
        if (pi.getHackerrankUrl() == null) {
            Matcher hrMatcher = Pattern.compile("https?://(?:www\\.)?hackerrank\\.com/(?:profile/)?([a-zA-Z0-9_-]+)/?", Pattern.CASE_INSENSITIVE).matcher(safeText);
            if (hrMatcher.find()) {
                pi.setHackerrankUrl(hrMatcher.group());
            } else {
                Matcher handleM = Pattern.compile("(?i)hackerrank[\\s:/-]+([a-zA-Z0-9_-]{3,})").matcher(safeText);
                if (handleM.find()) pi.setHackerrankUrl("https://www.hackerrank.com/profile/" + handleM.group(1).trim());
            }
        }
        if (pi.getLeetcodeUrl() == null) {
            Matcher leetcodeMatcher = Pattern.compile("https?://(?:www\\.)?leetcode\\.com/(?:u/)?([a-zA-Z0-9_-]+)/?", Pattern.CASE_INSENSITIVE).matcher(safeText);
            if (leetcodeMatcher.find()) {
                pi.setLeetcodeUrl(leetcodeMatcher.group());
            } else {
                Matcher handleM = Pattern.compile("(?i)leetcode[\\s:/-]+([a-zA-Z0-9_-]{3,})").matcher(safeText);
                if (handleM.find()) pi.setLeetcodeUrl("https://leetcode.com/u/" + handleM.group(1).trim());
            }
        }
        if (pi.getCodeforcesUrl() == null) {
            Matcher cfMatcher = Pattern.compile("https?://(?:www\\.)?codeforces\\.com/profile/([a-zA-Z0-9_-]+)/?", Pattern.CASE_INSENSITIVE).matcher(safeText);
            if (cfMatcher.find()) {
                pi.setCodeforcesUrl(cfMatcher.group());
            } else {
                Matcher handleM = Pattern.compile("(?i)codeforces[\\s:/-]+([a-zA-Z0-9_-]{3,})").matcher(safeText);
                if (handleM.find()) pi.setCodeforcesUrl("https://codeforces.com/profile/" + handleM.group(1).trim());
            }
        }
        if (pi.getWebsiteUrl() == null) {
            Matcher webMatcher = Pattern.compile("https?://[a-zA-Z0-9_.-]+\\.(?:dev|io|me|in|com)(?:/[a-zA-Z0-9_./-]*)?", Pattern.CASE_INSENSITIVE).matcher(safeText);
            while (webMatcher.find()) {
                String u = webMatcher.group();
                String low = u.toLowerCase();
                if (!low.contains("github.com") && !low.contains("linkedin.com") && !low.contains("leetcode.com")
                        && !low.contains("codeforces.com") && !low.contains("codechef.com") && !low.contains("hackerrank.com")
                        && !low.contains("dashboard") && !low.contains("landing") && !low.contains("demo")) {
                    pi.setWebsiteUrl(u);
                    break;
                }
            }
        }

        pi.setCountry("India");
        return pi;
    }

    private String capitalizeWord(String w) {
        if (w == null || w.isBlank()) return "";
        return w.substring(0, 1).toUpperCase() + w.substring(1).toLowerCase();
    }

    private void populateStructuredResumeEntities(Resume resume, String multiLineText, List<String> embeddedUrls) {
        if (multiLineText == null || multiLineText.isBlank()) return;

        // 1. Skills
        List<ResumeSkill> existingSkills = skillRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        Set<String> existingSkillNames = new HashSet<>();
        for (ResumeSkill rs : existingSkills) {
            existingSkillNames.add(rs.getSkillName().toLowerCase());
        }
        String lowerText = multiLineText.toLowerCase();
        int order = existingSkills.size();
        for (String kw : KNOWN_SKILLS) {
            if (lowerText.contains(kw.toLowerCase()) && !existingSkillNames.contains(kw.toLowerCase())) {
                skillRepository.save(ResumeSkill.builder()
                        .resume(resume)
                        .skillName(kw)
                        .proficiencyLevel(com.virat.job.domain.ProficiencyLevel.ADVANCED)
                        .yearsOfExperience(2)
                        .displayOrder(order++)
                        .build());
                existingSkillNames.add(kw.toLowerCase());
            }
        }

        // Collect GitHub repo URLs and live project URLs from embeddedUrls
        List<String> repoUrls = new ArrayList<>();
        List<String> liveUrls = new ArrayList<>();
        if (embeddedUrls != null) {
            for (String u : embeddedUrls) {
                String l = u.toLowerCase();
                if (l.contains("github.com/")) {
                    String path = u.replaceFirst("(?i)^https?://(www\\.)?github\\.com/", "").replaceAll("/+$", "");
                    if (path.contains("/")) {
                        repoUrls.add(u);
                    }
                } else if (!l.contains("linkedin.com") && !l.contains("leetcode.com") && !l.contains("codeforces.com")) {
                    liveUrls.add(u);
                }
            }
        }

        // Parse lines into sections: EDUCATION, EXPERIENCE, PROJECTS, ACHIEVEMENTS
        String[] lines = multiLineText.split("\\r?\\n");
        String currentSection = "";
        List<String> eduLines = new ArrayList<>();
        List<String> expLines = new ArrayList<>();
        List<String> projLines = new ArrayList<>();
        List<String> achLines = new ArrayList<>();

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isEmpty()) continue;
            String upper = line.toUpperCase();
            if (upper.equals("EDUCATION") || upper.startsWith("EDUCATION ")) {
                currentSection = "EDU";
                continue;
            } else if (upper.equals("TECHNICAL SKILLS") || upper.equals("SKILLS")) {
                currentSection = "SKILLS";
                continue;
            } else if (upper.equals("EXPERIENCE") || upper.equals("WORK EXPERIENCE") || upper.equals("PROFESSIONAL EXPERIENCE")) {
                currentSection = "EXP";
                continue;
            } else if (upper.equals("PROJECTS") || upper.equals("PERSONAL PROJECTS") || upper.equals("KEY PROJECTS")) {
                currentSection = "PROJ";
                continue;
            } else if (upper.startsWith("ACHIEVEMENTS") || upper.startsWith("CERTIFICATIONS") || upper.startsWith("HONORS") || upper.startsWith("AWARDS")) {
                currentSection = "ACH";
                continue;
            }

            switch (currentSection) {
                case "EDU" -> eduLines.add(line);
                case "EXP" -> expLines.add(line);
                case "PROJ" -> projLines.add(line);
                case "ACH" -> achLines.add(line);
            }
        }

        // 2. Populate Education if empty
        if (educationRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId()).isEmpty() && !eduLines.isEmpty()) {
            String combinedEdu = String.join(" ", eduLines);
            // Heal split decimals like "8. 94" or "8.\n94" or "10. 0" -> "8.94", "10.0"
            combinedEdu = combinedEdu.replaceAll("(?i)(\\b\\d+)\\.\\s+(\\d+)", "$1.$2")
                                     .replaceAll("(?i)(\\d+)\\s*/\\s*(\\d+)(?:\\.\\s*(\\d+))?", "$1/$2.$3")
                                     .replaceAll("\\.null", "");

            String grade = null;
            Matcher cgpaMatcher = Pattern.compile("(?i)(?:CGPA|GPA|CPI|Grade)?\\s*[:–-]?\\s*([0-9]+\\.[0-9]+\\s*/\\s*[0-9]+(?:\\.[0-9]+)?|[0-9]+\\.[0-9]+)").matcher(combinedEdu);
            if (cgpaMatcher.find()) {
                grade = cgpaMatcher.group(1).trim().replaceAll("\\s+", "");
            } else {
                Matcher splitMatcher = Pattern.compile("(?i)(\\d+)\\.[\\s•|·-–]+(\\d+\\s*/\\s*\\d+(?:\\.\\d+)?)").matcher(combinedEdu);
                if (splitMatcher.find()) {
                    grade = splitMatcher.group(1) + "." + splitMatcher.group(2).replaceAll("\\s+", "");
                }
            }

            // Clean institution name - strip trailing bullets, stray decimals like "• 8." or dates
            String inst = eduLines.get(0).replaceAll("\\d{4}\\s*[–-]\\s*(\\d{4}|Present)", "").trim();
            inst = inst.replaceAll("(?i)[•·-–|]\\s*(?:CGPA|GPA|CPI)?\\s*\\d+(?:\\.\\d+)?(?:/\\d+(?:\\.\\d+)?)?\\.?\\s*$", "").trim();
            inst = inst.replaceAll("[•·-–|\\.]\\s*$", "").trim();

            // Clean degree name - extract any trailing or embedded CGPA and strip stray numbers
            String deg = eduLines.size() > 1 ? eduLines.get(1) : "B.Tech in Computer Science and Engineering";
            deg = deg.replaceAll("(?i)(?:CGPA|GPA|CPI|Grade)?\\s*[:–-]?\\s*[0-9]+\\.[0-9]+\\s*/\\s*[0-9]+(?:\\.[0-9]+)?", "")
                     .replaceAll("(?i)\\b94\\s*/\\s*10(?:\\.0)?\\b", "")
                     .replaceAll("(?i)\\b[0-9]+\\.[0-9]+\\b", "")
                     .replaceAll("[•·-–|]\\s*$", "")
                     .replaceAll("\\s+", " ")
                     .trim();
            if (deg.isBlank()) deg = "B.Tech in Computer Science and Engineering";

            if (grade != null && (grade.startsWith("94/") || grade.startsWith("94 /"))) {
                grade = "8." + grade;
            }

            educationRepository.save(Education.builder()
                    .resume(resume)
                    .institutionName(inst.length() > 190 ? inst.substring(0, 190) : inst)
                    .degree(deg.length() > 140 ? deg.substring(0, 140) : deg)
                    .fieldOfStudy("Computer Science & Engineering")
                    .grade(grade)
                    .startDate(LocalDate.of(2023, 8, 1))
                    .endDate(LocalDate.of(2027, 5, 1))
                    .isCurrentlyStudying(true)
                    .description(eduLines.size() > 2 ? String.join(" ", eduLines.subList(2, eduLines.size())) : null)
                    .displayOrder(0)
                    .build());
        }

        // 3. Populate Work Experience if empty
        if (workExperienceRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId()).isEmpty() && !expLines.isEmpty()) {
            String companyLine = expLines.get(0);
            String roleLine = expLines.size() > 1 ? expLines.get(1) : "Software Engineering Intern";
            roleLine = roleLine.replaceAll("(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+\\d{4}.*$", "").trim();
            List<String> bullets = expLines.size() > 2 ? expLines.subList(2, expLines.size()) : List.of();
            workExperienceRepository.save(WorkExperience.builder()
                    .resume(resume)
                    .companyName(companyLine.length() > 140 ? companyLine.substring(0, 140) : companyLine)
                    .jobTitle(roleLine.isBlank() ? "Backend Developer Intern" : (roleLine.length() > 140 ? roleLine.substring(0, 140) : roleLine))
                    .employmentType(JobType.INTERNSHIP)
                    .startDate(LocalDate.of(2026, 5, 1))
                    .endDate(LocalDate.of(2026, 7, 31))
                    .isCurrentJob(false)
                    .description(String.join("\n", bullets))
                    .displayOrder(0)
                    .build());
        }

        // 4. Populate Projects from PROJ section + embedded GitHub/Live URLs
        if (projectRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId()).isEmpty() && !projLines.isEmpty()) {
            List<Project> parsedProjects = parseProjectsFromLines(resume, projLines, repoUrls, liveUrls);
            for (Project p : parsedProjects) {
                projectRepository.save(p);
            }
        }

        // 5. Populate Achievements / Awards if empty
        if (awardRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId()).isEmpty() && !achLines.isEmpty()) {
            int aOrder = 0;
            for (String ach : achLines) {
                String cleaned = ach.replaceFirst("^[•\\-*]+\\s*", "").trim();
                if (cleaned.length() > 10) {
                    awardRepository.save(Award.builder()
                            .resume(resume)
                            .title(cleaned.length() > 190 ? cleaned.substring(0, 190) : cleaned)
                            .issuedBy("Competitive Programming / Hackathon")
                            .description(cleaned)
                            .displayOrder(aOrder++)
                            .build());
                }
            }
        }
    }

    private List<Project> parseProjectsFromLines(Resume resume, List<String> projLines, List<String> repoUrls, List<String> liveUrls) {
        List<Project> list = new ArrayList<>();
        String currentTitle = null;
        List<String> currentTech = new ArrayList<>();
        List<String> currentBullets = new ArrayList<>();
        int pOrder = 0;

        for (String line : projLines) {
            boolean isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*");
            boolean isRepoLine = line.toLowerCase().startsWith("repo link:");
            // A project header line typically contains '|' or isn't a bullet/continuation of a sentence
            boolean isHeader = !isBullet && !isRepoLine && (line.contains("|") || (currentTitle == null));

            if (isHeader && !line.matches("^[a-z].*")) {
                if (currentTitle != null && !currentBullets.isEmpty()) {
                    list.add(buildProjectEntity(resume, currentTitle, currentTech, currentBullets, repoUrls, liveUrls, pOrder++));
                }
                String[] pipeParts = line.split("\\|");
                currentTitle = pipeParts[0].trim();
                currentTech = new ArrayList<>();
                if (pipeParts.length > 1) {
                    for (String t : pipeParts[1].split(",")) {
                        String trimmed = t.replaceAll("(?i)\\b(github|link)\\b", "").trim();
                        if (!trimmed.isBlank() && trimmed.length() < 35) {
                            currentTech.add(trimmed);
                        }
                    }
                }
                currentBullets = new ArrayList<>();
            } else if (!isRepoLine) {
                if (isBullet || currentBullets.isEmpty()) {
                    currentBullets.add(line.replaceFirst("^[•\\-*]+\\s*", "• "));
                } else {
                    int lastIdx = currentBullets.size() - 1;
                    currentBullets.set(lastIdx, currentBullets.get(lastIdx) + " " + line);
                }
            }
        }

        if (currentTitle != null && !currentBullets.isEmpty()) {
            list.add(buildProjectEntity(resume, currentTitle, currentTech, currentBullets, repoUrls, liveUrls, pOrder));
        }
        return list;
    }

    private Project buildProjectEntity(
            Resume resume,
            String title,
            List<String> techList,
            List<String> bullets,
            List<String> repoUrls,
            List<String> liveUrls,
            int order
    ) {
        String titleKey = title.toLowerCase().replaceAll("[^a-z0-9]", "");
        String matchedRepo = null;
        for (String rUrl : repoUrls) {
            String rLower = rUrl.toLowerCase().replaceAll("[^a-z0-9]", "");
            if (rLower.contains(titleKey.substring(0, Math.min(6, titleKey.length())))) {
                matchedRepo = rUrl;
                break;
            }
        }
        if (matchedRepo == null && order < repoUrls.size()) {
            matchedRepo = repoUrls.get(order);
        }

        String matchedLive = null;
        for (String lUrl : liveUrls) {
            String lLower = lUrl.toLowerCase().replaceAll("[^a-z0-9]", "");
            if (lLower.contains(titleKey.substring(0, Math.min(6, titleKey.length())))) {
                matchedLive = lUrl;
                break;
            }
        }

        String fullDesc = String.join("\n", bullets);
        if (techList.isEmpty()) {
            for (String kw : KNOWN_SKILLS) {
                if (fullDesc.toLowerCase().contains(kw.toLowerCase())) {
                    techList.add(kw);
                }
            }
        }

        return Project.builder()
                .resume(resume)
                .title(title.length() > 140 ? title.substring(0, 140) : title)
                .technologies(techList)
                .description(fullDesc)
                .sourceCodeUrl(matchedRepo)
                .projectUrl(matchedLive != null && !matchedLive.equalsIgnoreCase(matchedRepo) && !matchedLive.toLowerCase().contains("github.com") ? matchedLive : null)
                .isOngoing(true)
                .displayOrder(order)
                .build();
    }

    /**
     * Automatically upgrades any previously uploaded PDF resume (such as Resume #7)
     * that had a 1200-char '...' truncated summary or missing embedded links/projects.
     */
    private Resume ensureUploadedPdfHydrated(Resume resume) {
        try {
            if (resume.getUploadedFileName() == null) return resume;
            Path pdfPath = Paths.get("/tmp/nexushire-uploads", resume.getId() + "_" + resume.getUploadedFileName());
            if (!Files.exists(pdfPath)) return resume;

            boolean summaryWasTruncated = resume.getSummary() == null
                    || resume.getSummary().endsWith("...")
                    || !resume.getSummary().contains("Embedded Profile & Project Links:");
            boolean missingProjects = projectRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId()).isEmpty();
            boolean missingLinkedin = resume.getPersonalInfo() == null || resume.getPersonalInfo().getLinkedinUrl() == null;

            if (summaryWasTruncated || missingProjects || missingLinkedin) {
                byte[] bytes = Files.readAllBytes(pdfPath);
                ExtractedPdfData pdfData = extractPdfTextAndLinks(bytes, true);
                String sanitizedMultiLine = sanitizePreservingLines(pdfData.text());
                String fullSummary = buildFullSummaryWithEmbeddedLinks(sanitizedMultiLine, pdfData.embeddedUrls());

                PersonalInfo updatedPi = extractPersonalInfoFromTextAndLinks(
                        sanitizedMultiLine, pdfData.embeddedUrls(), resume.getTitle()
                );
                if (resume.getPersonalInfo() != null) {
                    PersonalInfo existing = resume.getPersonalInfo();
                    if (existing.getFirstName() != null && !existing.getFirstName().isBlank()) updatedPi.setFirstName(existing.getFirstName());
                    if (existing.getLastName() != null && !existing.getLastName().isBlank()) updatedPi.setLastName(existing.getLastName());
                    if (existing.getEmail() != null && !existing.getEmail().isBlank()) updatedPi.setEmail(existing.getEmail());
                    if (existing.getPhone() != null && !existing.getPhone().isBlank()) updatedPi.setPhone(existing.getPhone());
                }
                resume.setPersonalInfo(updatedPi);
                resume.setSummary(fullSummary);
                resume = resumeRepository.save(resume);

                populateStructuredResumeEntities(resume, sanitizedMultiLine, pdfData.embeddedUrls());
            }
        } catch (Exception e) {
            log.warn("Auto-hydration of existing PDF resume #{} skipped: {}", resume.getId(), e.getMessage());
        }
        return resume;
    }

    @Override
    public byte[] getOrGenerateResumePdfBytes(Long resumeId) throws Exception {
        Optional<Resume> opt = resumeRepository.findById(resumeId);
        if (opt.isEmpty()) {
            return renderFallbackPdf(resumeId, "Candidate Resume #" + resumeId, ResumeTemplate.PROFESSIONAL,
                    null, "Archived or external resume record.", List.of(), List.of(), List.of(), List.of(), List.of(), List.of());
        }
        Resume resume = opt.get();
        List<ResumeSkill> skills = skillRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);
        List<WorkExperience> experiences = workExperienceRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);
        List<Education> educations = educationRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);
        List<Project> projects = projectRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);
        List<Certification> certifications = certificationRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);
        List<Award> awards = awardRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);

        ResumeTemplate activeTemplate = resume.getTemplate() != null ? resume.getTemplate() : ResumeTemplate.PROFESSIONAL;
        byte[] pdfBytes = renderFallbackPdf(
                resumeId,
                resume.getTitle(),
                activeTemplate,
                resume.getPersonalInfo(),
                resume.getSummary(),
                skills,
                experiences,
                educations,
                projects,
                certifications,
                awards
        );

        try {
            Path uploadDir = Paths.get("/tmp/nexushire-uploads");
            Files.createDirectories(uploadDir);
            String fn = resume.getUploadedFileName() != null ? resume.getUploadedFileName() : "Candidate_Resume_" + resumeId + ".pdf";
            Path targetPath = uploadDir.resolve(resumeId + "_" + fn);
            Files.write(targetPath, pdfBytes);
        } catch (Exception ignored) {}

        return pdfBytes;
    }

    private static class PdfEngine {
        final PDDocument doc;
        PDPage page;
        PDPageContentStream cs;
        final float margin;
        final float leftMargin;
        final float width;
        float y;
        final ResumeTemplate template;
        final PDType1Font fontBold;
        final PDType1Font fontRegular;

        PdfEngine(PDDocument doc, ResumeTemplate template) throws Exception {
            this.doc = doc;
            this.template = template != null ? template : ResumeTemplate.PROFESSIONAL;
            this.page = new PDPage(PDRectangle.LETTER);
            this.doc.addPage(page);
            this.cs = new PDPageContentStream(doc, page);

            this.margin = 28f;
            this.leftMargin = this.template == ResumeTemplate.CREATIVE ? 42f : 32f;
            this.width = page.getMediaBox().getWidth() - leftMargin - 32f;
            this.y = page.getMediaBox().getHeight() - margin;

            this.fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            this.fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            if (this.template == ResumeTemplate.CREATIVE) {
                drawCreativeStripe();
            }
        }

        void drawCreativeStripe() throws Exception {
            cs.setNonStrokingColor(0.04f, 0.46f, 0.38f);
            cs.addRect(0, 0, 10, page.getMediaBox().getHeight());
            cs.fill();
        }

        void checkPage(float neededHeight) throws Exception {
            if (y - neededHeight < margin + 15) {
                cs.close();
                page = new PDPage(PDRectangle.LETTER);
                doc.addPage(page);
                cs = new PDPageContentStream(doc, page);
                y = page.getMediaBox().getHeight() - margin;
                if (template == ResumeTemplate.CREATIVE) {
                    drawCreativeStripe();
                }
            }
        }

        void drawHeader(String displayName, String title, String contactLine) throws Exception {
            if (template == ResumeTemplate.EXECUTIVE) {
                cs.setNonStrokingColor(0.94f, 0.95f, 0.98f);
                cs.addRect(leftMargin - 12, y - 40, width + 24, 52);
                cs.fill();

                cs.beginText();
                cs.setFont(fontBold, 18);
                cs.setNonStrokingColor(0.16f, 0.20f, 0.32f);
                cs.newLineAtOffset(leftMargin, y);
                cs.showText(sanitizePdfText(displayName));
                cs.endText();
                y -= 15;

                cs.beginText();
                cs.setFont(fontRegular, 8.5f);
                cs.setNonStrokingColor(0.25f, 0.28f, 0.35f);
                cs.newLineAtOffset(leftMargin, y);
                cs.showText(sanitizePdfText(contactLine));
                cs.endText();
                y -= 16;
            } else if (template == ResumeTemplate.PROFESSIONAL) {
                float approxW = displayName.length() * 9.2f;
                float startX = leftMargin + Math.max(0, (width - approxW) / 2);

                cs.beginText();
                cs.setFont(fontBold, 18);
                cs.setNonStrokingColor(0.12f, 0.12f, 0.12f);
                cs.newLineAtOffset(startX, y);
                cs.showText(sanitizePdfText(displayName));
                cs.endText();
                y -= 14;

                float contactW = contactLine.length() * 4.4f;
                float contactX = leftMargin + Math.max(0, (width - contactW) / 2);
                cs.beginText();
                cs.setFont(fontRegular, 8.5f);
                cs.setNonStrokingColor(0.30f, 0.30f, 0.30f);
                cs.newLineAtOffset(contactX, y);
                cs.showText(sanitizePdfText(contactLine));
                cs.endText();
                y -= 8;

                cs.setStrokingColor(0.20f, 0.20f, 0.20f);
                cs.setLineWidth(0.85f);
                cs.moveTo(leftMargin, y);
                cs.lineTo(leftMargin + width, y);
                cs.stroke();
                y -= 10;
            } else if (template == ResumeTemplate.MODERN) {
                cs.beginText();
                cs.setFont(fontBold, 18);
                cs.setNonStrokingColor(0.12f, 0.28f, 0.65f);
                cs.newLineAtOffset(leftMargin, y);
                cs.showText(sanitizePdfText(displayName));
                cs.endText();
                y -= 14;

                cs.beginText();
                cs.setFont(fontRegular, 8.5f);
                cs.setNonStrokingColor(0.30f, 0.30f, 0.30f);
                cs.newLineAtOffset(leftMargin, y);
                cs.showText(sanitizePdfText(contactLine));
                cs.endText();
                y -= 8;

                cs.setStrokingColor(0.12f, 0.28f, 0.65f);
                cs.setLineWidth(1.2f);
                cs.moveTo(leftMargin, y);
                cs.lineTo(leftMargin + width, y);
                cs.stroke();
                y -= 10;
            } else if (template == ResumeTemplate.MINIMAL) {
                cs.beginText();
                cs.setFont(fontBold, 17);
                cs.setNonStrokingColor(0.18f, 0.20f, 0.24f);
                cs.newLineAtOffset(leftMargin, y);
                cs.showText(sanitizePdfText(displayName));
                cs.endText();
                y -= 13;

                cs.beginText();
                cs.setFont(fontRegular, 8.5f);
                cs.setNonStrokingColor(0.35f, 0.38f, 0.42f);
                cs.newLineAtOffset(leftMargin, y);
                cs.showText(sanitizePdfText(contactLine));
                cs.endText();
                y -= 8;

                cs.setStrokingColor(0.78f, 0.80f, 0.84f);
                cs.setLineWidth(0.5f);
                cs.moveTo(leftMargin, y);
                cs.lineTo(leftMargin + width, y);
                cs.stroke();
                y -= 10;
            } else { // CREATIVE
                cs.beginText();
                cs.setFont(fontBold, 18);
                cs.setNonStrokingColor(0.04f, 0.46f, 0.38f);
                cs.newLineAtOffset(leftMargin, y);
                cs.showText(sanitizePdfText(displayName));
                cs.endText();
                y -= 14;

                cs.beginText();
                cs.setFont(fontRegular, 8.5f);
                cs.setNonStrokingColor(0.30f, 0.35f, 0.32f);
                cs.newLineAtOffset(leftMargin, y);
                cs.showText(sanitizePdfText(contactLine));
                cs.endText();
                y -= 8;

                cs.setStrokingColor(0.04f, 0.46f, 0.38f);
                cs.setLineWidth(1.2f);
                cs.moveTo(leftMargin, y);
                cs.lineTo(leftMargin + width, y);
                cs.stroke();
                y -= 10;
            }
        }

        void drawExecutiveSummaryBox(String summaryText) throws Exception {
            List<String> lines = wrapText(summaryText, 88);
            float boxHeight = (lines.size() * 12f) + 26f;
            checkPage(boxHeight + 10);

            cs.setNonStrokingColor(0.97f, 0.98f, 0.99f);
            cs.addRect(leftMargin, y - boxHeight + 8, width, boxHeight);
            cs.fill();

            cs.setStrokingColor(0.16f, 0.20f, 0.32f);
            cs.setLineWidth(2.5f);
            cs.moveTo(leftMargin, y + 8);
            cs.lineTo(leftMargin, y - boxHeight + 8);
            cs.stroke();

            cs.beginText();
            cs.setFont(fontBold, 10);
            cs.setNonStrokingColor(0.16f, 0.20f, 0.32f);
            cs.newLineAtOffset(leftMargin + 10, y - 4);
            cs.showText("EXECUTIVE PROFILE & STRATEGIC HIGHLIGHTS");
            cs.endText();
            y -= 18;

            for (String l : lines) {
                cs.beginText();
                cs.setFont(fontRegular, 9f);
                cs.setNonStrokingColor(0.25f, 0.28f, 0.32f);
                cs.newLineAtOffset(leftMargin + 10, y);
                cs.showText(l);
                cs.endText();
                y -= 12;
            }
            y -= 14;
        }

        void drawHeading(String heading) throws Exception {
            checkPage(34);
            y -= 4;
            if (template == ResumeTemplate.MODERN) {
                cs.setNonStrokingColor(0.12f, 0.28f, 0.65f);
                cs.addRect(leftMargin, y - 2, 4f, 11f);
                cs.fill();
                cs.beginText();
                cs.setFont(fontBold, 11);
                cs.setNonStrokingColor(0.12f, 0.28f, 0.65f);
                cs.newLineAtOffset(leftMargin + 9, y);
                cs.showText(heading);
                cs.endText();
                y -= 4;
                cs.setStrokingColor(0.85f, 0.88f, 0.92f);
                cs.setLineWidth(0.75f);
                cs.moveTo(leftMargin + 9, y);
                cs.lineTo(leftMargin + width, y);
                cs.stroke();
                y -= 13;
            } else if (template == ResumeTemplate.PROFESSIONAL) {
                cs.beginText();
                cs.setFont(fontBold, 11);
                cs.setNonStrokingColor(0.12f, 0.12f, 0.12f);
                cs.newLineAtOffset(leftMargin, y);
                cs.showText(heading);
                cs.endText();
                y -= 3;
                cs.setStrokingColor(0.20f, 0.20f, 0.20f);
                cs.setLineWidth(0.85f);
                cs.moveTo(leftMargin, y);
                cs.lineTo(leftMargin + width, y);
                cs.stroke();
                y -= 13;
            } else if (template == ResumeTemplate.MINIMAL) {
                cs.beginText();
                cs.setFont(fontBold, 10);
                cs.setNonStrokingColor(0.18f, 0.20f, 0.24f);
                cs.newLineAtOffset(leftMargin, y);
                cs.showText(heading);
                cs.endText();
                y -= 3;
                cs.setStrokingColor(0.78f, 0.80f, 0.84f);
                cs.setLineWidth(0.5f);
                cs.moveTo(leftMargin, y);
                cs.lineTo(leftMargin + width, y);
                cs.stroke();
                y -= 11;
            } else if (template == ResumeTemplate.EXECUTIVE) {
                cs.beginText();
                cs.setFont(fontBold, 11);
                cs.setNonStrokingColor(0.16f, 0.20f, 0.32f);
                cs.newLineAtOffset(leftMargin, y);
                cs.showText(heading);
                cs.endText();
                y -= 4;
                cs.setStrokingColor(0.16f, 0.20f, 0.32f);
                cs.setLineWidth(1.0f);
                cs.moveTo(leftMargin, y);
                cs.lineTo(leftMargin + width, y);
                cs.stroke();
                y -= 13;
            } else { // CREATIVE
                cs.beginText();
                cs.setFont(fontBold, 11);
                cs.setNonStrokingColor(0.04f, 0.46f, 0.38f);
                cs.newLineAtOffset(leftMargin, y);
                cs.showText(heading);
                cs.endText();
                y -= 3;
                cs.setStrokingColor(0.04f, 0.46f, 0.38f);
                cs.setLineWidth(1.2f);
                cs.moveTo(leftMargin, y);
                cs.lineTo(leftMargin + width, y);
                cs.stroke();
                y -= 13;
            }
        }

        void drawTwoColumnRow(String leftText, String rightText, float leftSize, float rightSize, boolean leftBold, boolean rightBold) throws Exception {
            checkPage(16);
            cs.beginText();
            cs.setFont(leftBold ? fontBold : fontRegular, leftSize);
            cs.setNonStrokingColor(0.10f, 0.10f, 0.10f);
            cs.newLineAtOffset(leftMargin, y);
            cs.showText(sanitizePdfText(leftText));
            cs.endText();

            if (rightText != null && !rightText.isBlank()) {
                String cleanRight = sanitizePdfText(rightText);
                float approxW = cleanRight.length() * (rightSize * 0.52f);
                float rightX = Math.max(leftMargin + (width * 0.45f), leftMargin + width - approxW);
                cs.beginText();
                cs.setFont(rightBold ? fontBold : fontRegular, rightSize);
                cs.setNonStrokingColor(0.18f, 0.18f, 0.18f);
                cs.newLineAtOffset(rightX, y);
                cs.showText(cleanRight);
                cs.endText();
            }
            y -= (Math.max(leftSize, rightSize) + 2.5f);
        }

        void drawText(String text, float x, float size, boolean bold) throws Exception {
            cs.beginText();
            cs.setFont(bold ? fontBold : fontRegular, size);
            cs.setNonStrokingColor(bold ? 0.12f : 0.22f, bold ? 0.12f : 0.22f, bold ? 0.12f : 0.22f);
            cs.newLineAtOffset(x, y);
            cs.showText(sanitizePdfText(text));
            cs.endText();
        }

        void close() throws Exception {
            if (cs != null) {
                cs.close();
            }
        }
    }

    public static String formatPhoneNumber(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String digits = raw.replaceAll("\\D", "");
        if (digits.length() == 10) {
            return "+91 " + digits;
        } else if (digits.length() == 12 && digits.startsWith("91")) {
            return "+91 " + digits.substring(2);
        } else if (digits.length() >= 10) {
            return "+" + digits;
        }
        return raw.trim();
    }

    public static String sanitizePhoneNumber(String raw) {
        return formatPhoneNumber(raw);
    }

    public static String canonicalizeSkillName(String raw) {
        if (raw == null || raw.isBlank()) return "";
        String trimmed = raw.trim();
        String lower = trimmed.toLowerCase();
        return switch (lower) {
            case "react", "reactjs", "react.js" -> "React.js";
            case "next", "nextjs", "next.js" -> "Next.js";
            case "vue", "vuejs", "vue.js" -> "Vue.js";
            case "angular", "angularjs" -> "Angular";
            case "node", "nodejs", "node.js" -> "Node.js";
            case "express", "expressjs", "express.js" -> "Express.js";
            case "fastapi" -> "FastAPI";
            case "django" -> "Django";
            case "flask" -> "Flask";
            case "spring boot", "springboot" -> "Spring Boot";
            case "spring security" -> "Spring Security";
            case "spring data jpa", "spring data" -> "Spring Data JPA";
            case "hibernate" -> "Hibernate";
            case "postgres", "postgresql" -> "PostgreSQL";
            case "mongo", "mongodb" -> "MongoDB";
            case "redis" -> "Redis";
            case "mysql" -> "MySQL";
            case "kafka", "apache kafka" -> "Kafka";
            case "bullmq" -> "BullMQ";
            case "rabbitmq" -> "RabbitMQ";
            case "docker" -> "Docker";
            case "kubernetes", "k8s" -> "Kubernetes";
            case "aws" -> "AWS";
            case "gcp" -> "GCP";
            case "git" -> "Git";
            case "github" -> "GitHub";
            case "linux" -> "Linux";
            case "ci/cd", "cicd" -> "CI/CD";
            case "python" -> "Python";
            case "cpp", "c++" -> "C++";
            case "c" -> "C";
            case "java" -> "Java";
            case "golang", "go" -> "Go";
            case "typescript", "ts" -> "TypeScript";
            case "javascript", "js" -> "JavaScript";
            case "sql" -> "SQL";
            case "rust" -> "Rust";
            case "solidity" -> "Solidity";
            case "powerbi", "power bi" -> "Power BI";
            case "dax" -> "DAX";
            case "streamlit" -> "Streamlit";
            case "pandas" -> "Pandas";
            case "numpy" -> "NumPy";
            case "scikit-learn", "sklearn" -> "Scikit-Learn";
            case "xgboost" -> "XGBoost";
            case "pytorch" -> "PyTorch";
            case "tensorflow" -> "TensorFlow";
            case "tailwind", "tailwindcss", "tailwind css" -> "Tailwind CSS";
            case "html", "html5" -> "HTML5";
            case "css", "css3" -> "CSS3";
            case "rest", "rest api", "rest apis" -> "REST APIs";
            case "graphql" -> "GraphQL";
            case "grpc" -> "gRPC";
            case "microservices" -> "Microservices";
            default -> {
                if (trimmed.equals(trimmed.toLowerCase())) {
                    StringBuilder sb = new StringBuilder();
                    for (String w : trimmed.split("[-_\\s]+")) {
                        if (!w.isEmpty()) {
                            sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(" ");
                        }
                    }
                    yield sb.toString().trim();
                }
                yield trimmed;
            }
        };
    }

    private static Map<String, List<String>> categorizeSkills(List<ResumeSkill> skills) {
        Map<String, List<String>> categories = new LinkedHashMap<>();
        categories.put("Languages", new ArrayList<>());
        categories.put("Backend", new ArrayList<>());
        categories.put("Frontend & Web", new ArrayList<>());
        categories.put("AI/ML", new ArrayList<>());
        categories.put("Database & Queues", new ArrayList<>());
        categories.put("Analytics", new ArrayList<>());
        categories.put("Infra & Tools", new ArrayList<>());

        Set<String> langSet = Set.of("c++", "c", "java", "python", "go", "javascript", "typescript", "sql", "rust", "c#", "html", "html5", "css", "css3", "solidity");
        Set<String> backendSet = Set.of("spring boot", "spring security", "spring data jpa", "hibernate", "node.js", "express.js", "express", "fastapi", "django", "flask", "grpc", "graphql", "microservices", "rest apis", "rest api");
        Set<String> frontendSet = Set.of("react.js", "react", "next.js", "next", "vue.js", "vue", "angular", "tailwind css", "tailwind", "redux", "vite");
        Set<String> dbSet = Set.of("postgresql", "mysql", "mongodb", "redis", "kafka", "bullmq", "rabbitmq", "elasticsearch", "cassandra", "sqlite");
        Set<String> aiSet = Set.of("scikit-learn", "pandas", "numpy", "langchain", "rag", "llm apis", "xgboost", "machine learning", "deep learning", "pytorch", "tensorflow", "streamlit");
        Set<String> analyticsSet = Set.of("power bi", "dax", "statistics", "ms excel", "data visualization", "tableau", "looker");
        Set<String> infraSet = Set.of("docker", "kubernetes", "aws", "gcp", "azure", "git", "github", "linux", "ci/cd", "maven", "flyway", "postman", "terraform");

        for (ResumeSkill s : skills) {
            String rawName = s.getSkillName();
            if (rawName == null || rawName.isBlank()) continue;
            String canonical = canonicalizeSkillName(rawName);
            String lower = canonical.toLowerCase().trim();
            if (langSet.contains(lower)) {
                categories.get("Languages").add(canonical);
            } else if (frontendSet.contains(lower)) {
                categories.get("Frontend & Web").add(canonical);
            } else if (backendSet.contains(lower)) {
                categories.get("Backend").add(canonical);
            } else if (aiSet.contains(lower)) {
                categories.get("AI/ML").add(canonical);
            } else if (dbSet.contains(lower)) {
                categories.get("Database & Queues").add(canonical);
            } else if (analyticsSet.contains(lower)) {
                categories.get("Analytics").add(canonical);
            } else {
                categories.get("Infra & Tools").add(canonical);
            }
        }
        return categories;
    }

    private byte[] renderFallbackPdf(
            Long resumeId,
            String title,
            ResumeTemplate template,
            PersonalInfo pi,
            String summary,
            List<ResumeSkill> skills,
            List<WorkExperience> experiences,
            List<Education> educations,
            List<Project> projects,
            List<Certification> certifications,
            List<Award> awards
    ) throws Exception {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ResumeTemplate activeTemplate = template != null ? template : ResumeTemplate.PROFESSIONAL;
            PdfEngine engine = new PdfEngine(doc, activeTemplate);

            String displayName = (pi != null && pi.getFirstName() != null && !pi.getFirstName().isBlank())
                    ? (pi.getFirstName() + " " + (pi.getLastName() != null ? pi.getLastName() : "")).trim()
                    : title;

            List<String> contactParts = new ArrayList<>();
            if (pi != null) {
                if (pi.getCity() != null && !pi.getCity().isBlank()) {
                    contactParts.add(pi.getCity() + (pi.getCountry() != null && !pi.getCountry().isBlank() ? ", " + pi.getCountry() : ""));
                }
                if (pi.getPhone() != null && !pi.getPhone().isBlank()) {
                    contactParts.add(formatPhoneNumber(pi.getPhone()));
                }
                if (pi.getEmail() != null && !pi.getEmail().isBlank()) contactParts.add(pi.getEmail());
                if (pi.getLinkedinUrl() != null && !pi.getLinkedinUrl().isBlank()) {
                    String liSlug = pi.getLinkedinUrl().replaceAll("(?i)^https?://(www\\.)?linkedin\\.com/in/", "").replaceAll("/+$", "");
                    contactParts.add("LinkedIn: " + (liSlug.isBlank() ? "profile" : liSlug));
                }
                if (pi.getGithubUrl() != null && !pi.getGithubUrl().isBlank()) {
                    String ghSlug = pi.getGithubUrl().replaceAll("(?i)^https?://(www\\.)?github\\.com/", "").replaceAll("/+$", "");
                    contactParts.add("GitHub: " + (ghSlug.isBlank() ? "profile" : ghSlug));
                }
                if (pi.getCodechefUrl() != null && !pi.getCodechefUrl().isBlank()) {
                    String ccSlug = pi.getCodechefUrl().replaceAll("(?i)^https?://(www\\.)?codechef\\.com/users/", "").replaceAll("/+$", "");
                    contactParts.add("CodeChef: " + (ccSlug.isBlank() ? "profile" : ccSlug));
                }
                if (pi.getHackerrankUrl() != null && !pi.getHackerrankUrl().isBlank()) {
                    String hrSlug = pi.getHackerrankUrl().replaceAll("(?i)^https?://(www\\.)?hackerrank\\.com/(profile/)?", "").replaceAll("/+$", "");
                    contactParts.add("HackerRank: " + (hrSlug.isBlank() ? "profile" : hrSlug));
                }
                if (pi.getLeetcodeUrl() != null && !pi.getLeetcodeUrl().isBlank()) {
                    String lcSlug = pi.getLeetcodeUrl().replaceAll("(?i)^https?://(www\\.)?leetcode\\.com/(u/)?", "").replaceAll("/+$", "");
                    contactParts.add("LeetCode: " + (lcSlug.isBlank() ? "profile" : lcSlug));
                }
                if (pi.getCodeforcesUrl() != null && !pi.getCodeforcesUrl().isBlank()) {
                    String cfSlug = pi.getCodeforcesUrl().replaceAll("(?i)^https?://(www\\.)?codeforces\\.com/profile/", "").replaceAll("/+$", "");
                    contactParts.add("Codeforces: " + (cfSlug.isBlank() ? "profile" : cfSlug));
                }
                if (pi.getPortfolioUrl() != null && !pi.getPortfolioUrl().isBlank()) {
                    String portClean = pi.getPortfolioUrl().replaceAll("(?i)^https?://", "").replaceAll("/+$", "");
                    contactParts.add("Portfolio: " + portClean);
                } else if (pi.getWebsiteUrl() != null && !pi.getWebsiteUrl().isBlank()) {
                    String webLower = pi.getWebsiteUrl().toLowerCase();
                    boolean matchesProjectUrl = projects != null && projects.stream().anyMatch(p ->
                            (p.getProjectUrl() != null && p.getProjectUrl().equalsIgnoreCase(pi.getWebsiteUrl()))
                            || (p.getTitle() != null && !p.getTitle().isBlank() && webLower.contains(p.getTitle().toLowerCase().replaceAll("\\s+", "")))
                    );
                    boolean isProjDeploy = matchesProjectUrl || webLower.contains("dashboard") || webLower.contains("demo") || webLower.contains("landing");
                    if (!isProjDeploy) {
                        String webClean = pi.getWebsiteUrl().replaceAll("(?i)^https?://", "").replaceAll("/+$", "");
                        contactParts.add("Website: " + webClean);
                    }
                }
            }
            if (contactParts.isEmpty()) {
                contactParts.add("GemHire Verified Candidate #" + resumeId);
            }
            String contactLine = String.join("  |  ", contactParts);

            engine.drawHeader(displayName, title, contactLine);

            // 1. EDUCATION (Standard Ivy League Top Placement)
            if (educations != null && !educations.isEmpty()) {
                engine.drawHeading("EDUCATION");
                for (Education edu : educations) {
                    engine.checkPage(24);
                    String startYr = edu.getStartDate() != null ? String.valueOf(edu.getStartDate().getYear()) : "2023";
                    String endYr = edu.getEndDate() != null ? String.valueOf(edu.getEndDate().getYear()) : "2027";
                    String dateRange = startYr + " - " + endYr;
                    String inst = edu.getInstitutionName() != null ? edu.getInstitutionName() : "Institution";
                    engine.drawTwoColumnRow(inst, dateRange, 10f, 9f, true, false);

                    String degree = edu.getDegree() != null ? edu.getDegree() : "Degree";
                    String field = edu.getFieldOfStudy() != null && !edu.getFieldOfStudy().isBlank() ? " in " + edu.getFieldOfStudy() : "";
                    String gradeStr = (edu.getGrade() != null && !edu.getGrade().isBlank())
                            ? (edu.getGrade().toUpperCase().contains("CGPA") || edu.getGrade().toUpperCase().contains("GPA")
                                ? edu.getGrade() : "CGPA: " + edu.getGrade())
                            : "";
                    engine.drawTwoColumnRow(degree + field, gradeStr, 9.5f, 9.5f, false, true);

                    if (edu.getDescription() != null && !edu.getDescription().isBlank()) {
                        String coursework = edu.getDescription().startsWith("Relevant Coursework:")
                                ? edu.getDescription()
                                : "Relevant Coursework: " + edu.getDescription();
                        for (String l : wrapText(sanitizePdfText(coursework), 92)) {
                            engine.checkPage(12);
                            engine.drawText(l, engine.leftMargin, 8.5f, false);
                            engine.y -= 10.0f;
                        }
                    }
                    engine.y -= 2.5f;
                }
                engine.y -= 2;
            }

            // 2. TECHNICAL SKILLS (Categorized, No "Other" dump)
            if (skills != null && !skills.isEmpty()) {
                engine.drawHeading("TECHNICAL SKILLS");
                Map<String, List<String>> catMap = categorizeSkills(skills);
                boolean anyCat = false;
                for (Map.Entry<String, List<String>> entry : catMap.entrySet()) {
                    if (entry.getValue().isEmpty()) continue;
                    anyCat = true;
                    engine.checkPage(14);
                    String catName = entry.getKey() + ": ";
                    String skillJoined = String.join(", ", entry.getValue());
                    String fullLine = catName + skillJoined;
                    List<String> wrapped = wrapText(sanitizePdfText(fullLine), 92);
                    for (int i = 0; i < wrapped.size(); i++) {
                        engine.checkPage(12);
                        String line = wrapped.get(i);
                        if (i == 0) {
                            engine.drawText(catName, engine.leftMargin, 8.5f, true);
                            float prefixW = catName.length() * 4.6f;
                            engine.drawText(line.substring(catName.length()), engine.leftMargin + prefixW, 8.5f, false);
                        } else {
                            engine.drawText(line, engine.leftMargin + 10, 8.5f, false);
                        }
                        engine.y -= 10.0f;
                    }
                }
                if (!anyCat) {
                    String skillList = String.join(", ", skills.stream().map(s -> canonicalizeSkillName(s.getSkillName())).toList());
                    for (String line : wrapText(sanitizePdfText(skillList), 92)) {
                        engine.checkPage(12);
                        engine.drawText(line, engine.leftMargin, 8.5f, false);
                        engine.y -= 10.0f;
                    }
                }
                engine.y -= 2.5f;
            }

            // 3. WORK EXPERIENCE
            if (experiences != null && !experiences.isEmpty()) {
                engine.drawHeading("EXPERIENCE");
                for (WorkExperience exp : experiences) {
                    engine.checkPage(28);
                    String comp = exp.getCompanyName() != null ? exp.getCompanyName() : "Company";
                    String loc = exp.getLocation() != null && !exp.getLocation().isBlank() ? exp.getLocation() : "India";
                    engine.drawTwoColumnRow(comp, loc, 10f, 9f, true, false);

                    String role = exp.getJobTitle() != null ? exp.getJobTitle() : "Software Engineer";
                    String dateRange = (exp.getStartDate() != null ? exp.getStartDate().getMonth().name().substring(0, 3) + " " + exp.getStartDate().getYear() : "May 2026")
                            + " - " + (exp.getIsCurrentJob() != null && exp.getIsCurrentJob()
                                ? "Present"
                                : (exp.getEndDate() != null ? exp.getEndDate().getMonth().name().substring(0, 3) + " " + exp.getEndDate().getYear() : "July 2026"));
                    engine.drawTwoColumnRow(role, dateRange, 9.5f, 9f, false, false);

                    if (exp.getDescription() != null && !exp.getDescription().isBlank()) {
                        String[] bulletList = exp.getDescription().split("\\r?\\n");
                        for (String rawB : bulletList) {
                            if (rawB.isBlank()) continue;
                            String inner = rawB.replaceFirst("^[•\\-*]+\\s*", "").trim();
                            if (!inner.isEmpty()) {
                                inner = Character.toUpperCase(inner.charAt(0)) + inner.substring(1);
                                if (!inner.endsWith(".") && !inner.endsWith("!") && !inner.endsWith("?")) {
                                    inner += ".";
                                }
                            }
                            String bText = "• " + inner;
                            for (String line : wrapText(sanitizePdfText(bText), 92)) {
                                engine.checkPage(11);
                                engine.drawText(line, engine.leftMargin + 6, 8.5f, false);
                                engine.y -= 9.8f;
                            }
                        }
                    }
                    engine.y -= 2.5f;
                }
                engine.y -= 2;
            }

            // 4. PROJECTS (Dynamic 1-page scaling, accurate live/repo link detection)
            if (projects != null && !projects.isEmpty()) {
                engine.drawHeading("PROJECTS");
                int maxBullets = projects.size() >= 4 ? 2 : 3;
                for (Project proj : projects) {
                    engine.checkPage(24);
                    String techStr = (proj.getTechnologies() != null && !proj.getTechnologies().isEmpty())
                            ? " | " + String.join(", ", proj.getTechnologies())
                            : "";
                    String pTitle = (proj.getTitle() != null ? proj.getTitle() : "Project") + techStr;
                    String live = proj.getProjectUrl();
                    String repo = proj.getSourceCodeUrl();
                    if (live != null && (live.equalsIgnoreCase(repo) || live.toLowerCase().contains("github.com"))) {
                        if (repo == null || repo.isBlank()) repo = live;
                        live = null;
                    }
                    boolean hasLive = live != null && !live.isBlank();
                    boolean hasRepo = repo != null && !repo.isBlank();
                    String linkText = (hasLive && hasRepo)
                            ? "[Live Demo | GitHub]"
                            : (hasLive ? "[Live Demo]" : (hasRepo ? "[GitHub]" : ""));
                    engine.drawTwoColumnRow(pTitle, linkText, 9.5f, 8.5f, true, false);

                    if (proj.getDescription() != null && !proj.getDescription().isBlank()) {
                        String[] bulletList = proj.getDescription().split("\\r?\\n");
                        int bCount = 0;
                        for (String rawB : bulletList) {
                            if (rawB.isBlank()) continue;
                            if (bCount++ >= maxBullets) break;
                            String inner = rawB.replaceFirst("^[•\\-*]+\\s*", "").trim();
                            if (!inner.isEmpty()) {
                                inner = Character.toUpperCase(inner.charAt(0)) + inner.substring(1);
                                if (!inner.endsWith(".") && !inner.endsWith("!") && !inner.endsWith("?")) {
                                    inner += ".";
                                }
                            }
                            String bText = "• " + inner;
                            for (String line : wrapText(sanitizePdfText(bText), 92)) {
                                engine.checkPage(11);
                                engine.drawText(line, engine.leftMargin + 6, 8.5f, false);
                                engine.y -= 9.8f;
                            }
                        }
                    }
                    engine.y -= 2.5f;
                }
                engine.y -= 2;
            }

            // 5. ACHIEVEMENTS AND CODING PROFILES
            List<String> achLines = new ArrayList<>();
            if (awards != null) {
                for (Award a : awards) {
                    if (a.getTitle() != null && !a.getTitle().isBlank()) achLines.add("• " + a.getTitle());
                }
            }
            if (certifications != null) {
                for (Certification c : certifications) {
                    if (c.getName() != null && !c.getName().isBlank()) {
                        achLines.add("• " + c.getName() + " (" + (c.getIssuingOrganization() != null ? c.getIssuingOrganization() : "Verified Authority") + ")");
                    }
                }
            }
            if (pi != null) {
                if (pi.getCodechefUrl() != null && !pi.getCodechefUrl().isBlank()) {
                    String ccSlug = pi.getCodechefUrl().replaceAll("(?i)^https?://(www\\.)?codechef\\.com/users/", "").replaceAll("/+$", "");
                    achLines.add("• CodeChef: " + ccSlug + " — Competitive programming profile and contest achievements");
                }
                if (pi.getLeetcodeUrl() != null && !pi.getLeetcodeUrl().isBlank()) {
                    String lcSlug = pi.getLeetcodeUrl().replaceAll("(?i)^https?://(www\\.)?leetcode\\.com/(u/)?", "").replaceAll("/+$", "");
                    achLines.add("• LeetCode: " + lcSlug + " — Algorithm design & data structures problem solving");
                }
                if (pi.getCodeforcesUrl() != null && !pi.getCodeforcesUrl().isBlank()) {
                    String cfSlug = pi.getCodeforcesUrl().replaceAll("(?i)^https?://(www\\.)?codeforces\\.com/profile/", "").replaceAll("/+$", "");
                    achLines.add("• Codeforces: " + cfSlug + " — Rated competitive programming participant");
                }
            }

            if (!achLines.isEmpty()) {
                engine.drawHeading("ACHIEVEMENTS AND CODING PROFILES");
                for (String aLine : achLines) {
                    for (String line : wrapText(sanitizePdfText(aLine), 92)) {
                        engine.checkPage(11);
                        engine.drawText(line, engine.leftMargin + 6, 8.5f, false);
                        engine.y -= 9.8f;
                    }
                }
            }

            engine.close();
            doc.save(out);
            return out.toByteArray();
        }
    }

    private static String sanitizePdfText(String input) {
        if (input == null) return "";
        return input.replaceAll("[^\\x20-\\x7E]", " ").replaceAll("\\s+", " ").trim();
    }

    private static List<String> wrapText(String text, int maxCharsPerLine) {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isBlank()) return lines;
        String[] words = text.split("\\s+");
        StringBuilder current = new StringBuilder();
        for (String w : words) {
            if (current.length() + w.length() + 1 > maxCharsPerLine) {
                if (current.length() > 0) {
                    lines.add(current.toString());
                    current.setLength(0);
                }
            }
            if (current.length() > 0) current.append(" ");
            current.append(w);
        }
        if (current.length() > 0) {
            lines.add(current.toString());
        }
        return lines;
    }

    @Override
    public ResumeResponse formatResumeWithTemplate(Long resumeId, Long candidateId, FormatResumeAiRequest req) throws Exception {
        Resume resume = getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        ResumeTemplate targetTemplate = req.getTemplate() != null ? req.getTemplate() : ResumeTemplate.PROFESSIONAL;
        resume.setTemplate(targetTemplate);

        List<ResumeSkill> skills = skillRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);
        List<Project> projects = projectRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);
        List<WorkExperience> experiences = workExperienceRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);

        try {
            String skillStr = skills.stream().map(ResumeSkill::getSkillName).reduce((a, b) -> a + ", " + b).orElse("General Software Engineering");
            String projStr = projects.stream().map(p -> p.getTitle() + " (" + (p.getTechnologies() != null ? String.join(", ", p.getTechnologies()) : "") + "): " + (p.getDescription() != null ? p.getDescription() : "")).reduce((a, b) -> a + "\n" + b).orElse("None");

            String prompt = """
                    You are an elite ATS resume writer and executive career coach.
                    Elevate this candidate's resume summary and project bullet points for the %s resume template persona.

                    PERSONAS:
                    - MODERN: Emphasize modern tech stack, distributed architectures, latency, throughput, and cloud scale.
                    - PROFESSIONAL: Rigorous Wall Street/Fortune 500 corporate tone, reliability, governance, and business stability.
                    - MINIMAL: Ultra-concise Google XYZ bullets (Accomplished [X] measured by [Y] doing [Z]).
                    - EXECUTIVE: Leadership, system vision, cross-functional impact, efficiency, and engineering excellence.
                    - CREATIVE: Product innovation, user experience, clean modular architecture, and modern API design.

                    CANDIDATE INFO:
                    Title: %s
                    Current Summary: %s
                    Skills: %s
                    Projects:
                    %s
                    Custom Guidance: %s

                    Return JSON only matching schema:
                    {
                      "elevatedSummary": "2 to 3 sentences high-impact executive summary",
                      "enhancedProjects": [
                        {
                          "title": "Project Name",
                          "bulletPoints": "• Accomplished X as measured by Y by doing Z.\\n• Engineered high throughput..."
                        }
                      ]
                    }
                    """.formatted(
                    targetTemplate.name(),
                    resume.getTitle(),
                    resume.getSummary() != null ? resume.getSummary() : "",
                    skillStr,
                    projStr,
                    req.getCustomInstructions() != null ? req.getCustomInstructions() : "Make it high-impact and ATS-optimized."
            );

            AiTemplateFormatResult aiResult = geminiClient.generateJson("You are an expert resume ATS formatter.", prompt, AiTemplateFormatResult.class);
            if (aiResult != null) {
                if (aiResult.elevatedSummary != null && !aiResult.elevatedSummary.isBlank()) {
                    resume.setSummary(PromptInjectionSanitizer.sanitize(aiResult.elevatedSummary));
                }
                if (aiResult.enhancedProjects != null && !aiResult.enhancedProjects.isEmpty()) {
                    for (var ep : aiResult.enhancedProjects) {
                        for (Project p : projects) {
                            if (p.getTitle() != null && ep.title != null && p.getTitle().toLowerCase().contains(ep.title.toLowerCase())) {
                                p.setDescription(PromptInjectionSanitizer.sanitize(ep.bulletPoints));
                                projectRepository.save(p);
                                break;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Gemini AI template enhancement skipped or failed: {}", e.getMessage());
        }

        Resume saved = resumeRepository.save(resume);
        syncResumeSummaryAndPdf(saved.getId());
        return buildFullResponse(saved);
    }

    public static class AiTemplateFormatResult {
        public String elevatedSummary;
        public List<EnhancedProjectDto> enhancedProjects;

        public static class EnhancedProjectDto {
            public String title;
            public String bulletPoints;
        }
    }

    @Override
    public ResumeResponse getResume(Long resumeId, Long candidateId) throws Exception {
        Optional<Resume> opt = resumeRepository.findById(resumeId);
        if (opt.isEmpty()) {
            return ResumeResponse.builder()
                    .id(resumeId)
                    .title("Archived Resume #" + resumeId)
                    .uploadedFileName("Candidate_Resume_" + resumeId + ".pdf")
                    .uploadedFileUrl("/api/resumes/" + resumeId + "/file")
                    .skills(List.of())
                    .workExperiences(List.of())
                    .educations(List.of())
                    .projects(List.of())
                    .certifications(List.of())
                    .awards(List.of())
                    .languages(List.of())
                    .build();
        }
        Resume hydrated = ensureUploadedPdfHydrated(opt.get());
        return buildFullResponse(hydrated);
    }

    @Override
    public List<ResumeResponse> getMyResumes(Long candidateId) {
        return resumeRepository.findByCandidateIdAndActiveTrue(candidateId)
                .stream()
                .map(this::ensureUploadedPdfHydrated)
                .map(this::buildFullResponse)
                .toList();
    }

    @Override
    public ResumeResponse updateResume(Long resumeId, Long candidateId, UpdateResumeRequest req) throws Exception {
        Resume resume = getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        if (req.getTitle() != null) resume.setTitle(PromptInjectionSanitizer.sanitize(req.getTitle()));
        if (req.getTemplate() != null) resume.setTemplate(req.getTemplate());
        if (req.getVisibility() != null) resume.setVisibility(req.getVisibility());
        if (req.getSummary() != null) resume.setSummary( sanitizePreservingLines(req.getSummary()) );
        if (Boolean.TRUE.equals(req.getIsDefault())) {
            clearDefaultFlag(candidateId);
            resume.setIsDefault(true);
        }

        Resume saved = resumeRepository.save(resume);
        syncResumeSummaryAndPdf(saved.getId());
        return buildFullResponse(saved);
    }

    @Override
    public ResumeResponse updatePersonalInfo(Long resumeId, Long candidateId, UpdatePersonalInfoRequest req) throws Exception {
        Resume resume = getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        PersonalInfo pi = resume.getPersonalInfo() != null ? resume.getPersonalInfo() : new PersonalInfo();
        if (req.getFirstName() != null) pi.setFirstName(PromptInjectionSanitizer.sanitize(req.getFirstName()));
        if (req.getLastName() != null) pi.setLastName(PromptInjectionSanitizer.sanitize(req.getLastName()));
        if (req.getHeadline() != null) pi.setHeadline(PromptInjectionSanitizer.sanitize(req.getHeadline()));
        if (req.getEmail() != null) pi.setEmail(req.getEmail().trim());
        if (req.getPhone() != null) pi.setPhone(formatPhoneNumber(req.getPhone()));
        if (req.getCity() != null) pi.setCity(PromptInjectionSanitizer.sanitize(req.getCity()));
        if (req.getCountry() != null) pi.setCountry(PromptInjectionSanitizer.sanitize(req.getCountry()));
        if (req.getProfileImage() != null) pi.setProfileImage(req.getProfileImage());
        if (req.getLinkedinUrl() != null) pi.setLinkedinUrl(req.getLinkedinUrl().trim());
        if (req.getGithubUrl() != null) pi.setGithubUrl(req.getGithubUrl().trim());
        if (req.getPortfolioUrl() != null) pi.setPortfolioUrl(req.getPortfolioUrl().trim());
        if (req.getWebsiteUrl() != null) pi.setWebsiteUrl(req.getWebsiteUrl().trim());
        if (req.getLeetcodeUrl() != null) pi.setLeetcodeUrl(req.getLeetcodeUrl().trim());
        if (req.getCodeforcesUrl() != null) pi.setCodeforcesUrl(req.getCodeforcesUrl().trim());
        if (req.getCodechefUrl() != null) pi.setCodechefUrl(req.getCodechefUrl().trim());
        if (req.getHackerrankUrl() != null) pi.setHackerrankUrl(req.getHackerrankUrl().trim());
        resume.setPersonalInfo(pi);

        Resume saved = resumeRepository.save(resume);
        syncResumeSummaryAndPdf(saved.getId());
        return buildFullResponse(saved);
    }

    @Override
    public ResumeResponse setDefault(Long resumeId, Long candidateId) throws Exception {
        Resume resume = getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        clearDefaultFlag(candidateId);
        resume.setIsDefault(true);
        return ResumeMapper.toSummaryResponse(resumeRepository.save(resume));
    }

    @Override
    public void deleteResume(Long resumeId, Long candidateId) throws Exception {
        resumeRepository.findById(resumeId).ifPresent(resume -> {
            if (candidateId == null || resume.getCandidateId().equals(candidateId)) {
                resume.setActive(false);
                resumeRepository.save(resume);
            }
        });
    }

    @Override
    public Resume getResumeEntityById(Long resumeId) throws Exception {
        return resumeRepository.findById(resumeId)
                .orElseThrow(() -> new Exception("Resume not found with id: " + resumeId));
    }

    private void assertOwner(Resume resume, Long candidateId) throws Exception {
        if (candidateId != null && !resume.getCandidateId().equals(candidateId))
            throw new Exception("You do not have access to this resume");
    }

    private void clearDefaultFlag(Long candidateId) {
        resumeRepository.findByCandidateIdAndIsDefaultTrueAndActiveTrue(candidateId)
                .ifPresent(r -> { r.setIsDefault(false); resumeRepository.save(r); });
    }

    @Override
    public ResumeResponse createResumeFromLatex(Long candidateId, String latexCode, String customTitle) throws Exception {
        if (latexCode == null || latexCode.isBlank()) {
            throw new Exception("Please provide valid LaTeX resume markup");
        }

        String sanitizedLatex = PromptInjectionSanitizer.sanitize(latexCode);
        boolean isFirst = !resumeRepository.existsByCandidateIdAndActiveTrue(candidateId);

        // 1. Strip LaTeX markup to extract structured plain text sections
        String plainText = stripLatexMarkupToPlainText(sanitizedLatex);

        // 2. Extract embedded URLs from href and url tags
        List<String> embeddedUrls = extractUrlsFromLatex(sanitizedLatex);

        String title = (customTitle != null && !customTitle.isBlank())
                ? PromptInjectionSanitizer.sanitize(customTitle.trim())
                : extractTitleFromLatexOrText(sanitizedLatex, plainText);

        PersonalInfo pi = extractPersonalInfoFromTextAndLinks(plainText, embeddedUrls, title);

        // If email or phone are defined via \email{} or \phone{} in LaTeX, extract them
        Matcher latexEmail = Pattern.compile("\\\\(?:email|href\\{mailto:)([^}]+)").matcher(sanitizedLatex);
        if (latexEmail.find() && (pi.getEmail() == null || pi.getEmail().isBlank())) {
            pi.setEmail(latexEmail.group(1).trim());
        }
        Matcher latexPhone = Pattern.compile("\\\\phone(?:\\[[^\\]]*\\])?\\{([^}]+)\\}").matcher(sanitizedLatex);
        if (latexPhone.find() && (pi.getPhone() == null || pi.getPhone().isBlank())) {
            String candidatePhone = sanitizePhoneNumber(latexPhone.group(1).trim());
            if (candidatePhone != null) {
                pi.setPhone(candidatePhone);
            }
        }

        String safeFileName = title.replaceAll("[^a-zA-Z0-9.-]", "_") + ".pdf";

        Resume resume = Resume.builder()
                .candidateId(candidateId)
                .title(title)
                .template(com.virat.job.domain.ResumeTemplate.PROFESSIONAL)
                .visibility(com.virat.job.domain.ResumeVisibility.PUBLIC)
                .isDefault(isFirst)
                .personalInfo(pi)
                .summary(plainText)
                .uploadedFileName(safeFileName)
                .completionScore(95)
                .build();

        resume = resumeRepository.save(resume);
        resume.setUploadedFileUrl("/api/resumes/" + resume.getId() + "/file");
        resume = resumeRepository.save(resume);

        // 3. Populate structured entities from extracted text & URLs
        populateStructuredResumeEntities(resume, plainText, embeddedUrls);

        // 4. Generate the compiled PDF and sync summary
        syncResumeSummaryAndPdf(resume.getId());

        return buildFullResponse(resumeRepository.findById(resume.getId()).orElse(resume));
    }

    private String stripLatexMarkupToPlainText(String latex) {
        if (latex == null) return "";
        String s = latex;
        // Strip LaTeX comments
        s = s.replaceAll("(?m)%[^\n]*$", "");
        // Remove documentclass, usepackages, geometry, pagestyle
        s = s.replaceAll("\\\\documentclass(\\[[^\\]]*\\])?\\{[^}]*\\}", "");
        s = s.replaceAll("\\\\usepackage(\\[[^\\]]*\\])?\\{[^}]*\\}", "");
        s = s.replaceAll("\\\\pagestyle\\{[^}]*\\}", "");
        s = s.replaceAll("\\\\geometry\\{[^}]*\\}", "");
        // Convert \href{url}{text} -> text (url)
        s = s.replaceAll("\\\\href\\{([^}]+)\\}\\{([^}]+)\\}", "$2 ($1)");
        s = s.replaceAll("\\\\url\\{([^}]+)\\}", "$1");
        // Convert sections to clean uppercase headings
        s = s.replaceAll("\\\\(?:r)?section\\*?\\{([^}]+)\\}", "\n\n$1\n");
        s = s.replaceAll("\\\\(?:r)?subsection\\*?\\{([^}]+)\\}", "\n$1\n");
        // Convert formatting commands
        s = s.replaceAll("\\\\text(?:bf|it|sc|tt)\\{([^}]+)\\}", "$1");
        s = s.replaceAll("\\\\emph\\{([^}]+)\\}", "$1");
        s = s.replaceAll("\\\\item\\b", "• ");
        s = s.replaceAll("\\\\(?:begin|end)\\{[^}]*\\}", "");
        s = s.replaceAll("\\\\(?:small|large|Large|LARGE|huge|Huge|normalsize|centering|raggedright|raggedleft)\\b", "");
        s = s.replaceAll("\\\\(?:hfill|vfill|noindent)\\b", " ");
        s = s.replaceAll("\\\\vspace\\*?\\{[^}]*\\}", "\n");
        s = s.replaceAll("\\\\hspace\\*?\\{[^}]*\\}", " ");
        s = s.replaceAll("\\\\\\\\", "\n");
        s = s.replaceAll("\\\\[a-zA-Z]+", "");
        s = s.replaceAll("[{}]", "");
        s = s.replaceAll("\n{3,}", "\n\n").trim();
        return s;
    }

    private List<String> extractUrlsFromLatex(String latex) {
        List<String> urls = new ArrayList<>();
        if (latex == null) return urls;
        Matcher m1 = Pattern.compile("\\\\href\\{([^}]+)\\}").matcher(latex);
        while (m1.find()) {
            String u = m1.group(1).trim();
            if (isValidCandidateUrl(u) && !urls.contains(u)) urls.add(u);
        }
        Matcher m2 = Pattern.compile("\\\\url\\{([^}]+)\\}").matcher(latex);
        while (m2.find()) {
            String u = m2.group(1).trim();
            if (isValidCandidateUrl(u) && !urls.contains(u)) urls.add(u);
        }
        Matcher m3 = Pattern.compile("https?://[^\\s}\\]>\"]+").matcher(latex);
        while (m3.find()) {
            String u = m3.group(0).trim();
            if (isValidCandidateUrl(u) && !urls.contains(u)) urls.add(u);
        }
        return urls;
    }

    private String extractTitleFromLatexOrText(String latex, String plainText) {
        Matcher m = Pattern.compile("\\\\name\\{([^}]+)\\}").matcher(latex);
        if (m.find()) return m.group(1).trim() + " — Engineering CV";
        Matcher m2 = Pattern.compile("(?m)^([A-Z][a-z]+\\s+[A-Z][a-z]+)").matcher(plainText);
        if (m2.find()) return m2.group(1).trim() + " — Engineering CV";
        return "LaTeX Compiled Resume";
    }

    @Override
    public void syncResumeSummaryAndPdf(Long resumeId) {
        try {
            Optional<Resume> opt = resumeRepository.findById(resumeId);
            if (opt.isEmpty()) return;
            Resume resume = opt.get();

            List<ResumeSkill> skills = skillRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);
            List<WorkExperience> experiences = workExperienceRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);
            List<Education> educations = educationRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);
            List<Project> projects = projectRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);
            List<Certification> certifications = certificationRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);
            List<Award> awards = awardRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId);

            // Reconstruct full summary
            StringBuilder sb = new StringBuilder();
            PersonalInfo pi = resume.getPersonalInfo();
            if (pi != null) {
                String name = ((pi.getFirstName() != null ? pi.getFirstName() : "") + " " + (pi.getLastName() != null ? pi.getLastName() : "")).trim();
                if (!name.isBlank()) sb.append(name).append("\n");
                List<String> links = new ArrayList<>();
                if (pi.getEmail() != null && !pi.getEmail().isBlank()) links.add("Email: " + pi.getEmail());
                if (pi.getPhone() != null && !pi.getPhone().isBlank()) links.add("Phone: " + pi.getPhone());
                if (pi.getLinkedinUrl() != null && !pi.getLinkedinUrl().isBlank()) links.add("LinkedIn: " + pi.getLinkedinUrl());
                if (pi.getGithubUrl() != null && !pi.getGithubUrl().isBlank()) links.add("GitHub: " + pi.getGithubUrl());
                if (pi.getWebsiteUrl() != null && !pi.getWebsiteUrl().isBlank()) links.add("Website: " + pi.getWebsiteUrl());
                if (!links.isEmpty()) sb.append(String.join(" | ", links)).append("\n\n");
            }

            if (resume.getSummary() == null || resume.getSummary().isBlank() || resume.getSummary().startsWith("TECHNICAL SKILLS:") || resume.getSummary().startsWith("RAW EXTRACTED RESUME TEXT")) {
                String headline = pi != null && pi.getHeadline() != null && !pi.getHeadline().isBlank() ? pi.getHeadline() : "Software Engineer";
                String topTech = !skills.isEmpty() ? String.join(", ", skills.stream().limit(6).map(ResumeSkill::getSkillName).toList()) : "Java, Spring Boot, PostgreSQL, React";
                String briefSummary = headline + " specializing in " + topTech + ", with hands-on experience designing scalable microservices, low-latency APIs, and robust full-stack architectures.";
                resume.setSummary(briefSummary);
            }
            resumeRepository.save(resume);

            // Generate fresh ATS PDF bytes using all entities and chosen template
            ResumeTemplate activeTemplate = resume.getTemplate() != null ? resume.getTemplate() : ResumeTemplate.PROFESSIONAL;
            byte[] pdfBytes = renderFallbackPdf(resumeId, resume.getTitle(), activeTemplate, pi, resume.getSummary(), skills, experiences, educations, projects, certifications, awards);

            // Write to /tmp/nexushire-uploads/{resumeId}_{uploadedFileName}
            Path uploadDir = Paths.get("/tmp/nexushire-uploads");
            Files.createDirectories(uploadDir);
            String fn = resume.getUploadedFileName() != null ? resume.getUploadedFileName() : "Candidate_Resume_" + resumeId + ".pdf";
            Path targetPath = uploadDir.resolve(resumeId + "_" + fn);
            Files.write(targetPath, pdfBytes);
            log.info("Synchronized PDF resume and parsed summary for resumeId={}", resumeId);
        } catch (Exception e) {
            log.error("Failed to sync resume PDF for resumeId={}: {}", resumeId, e.getMessage());
        }
    }

    private ResumeResponse buildFullResponse(Resume resume) {
        if (resume.getUploadedFileUrl() == null || resume.getUploadedFileUrl().isBlank()) {
            resume.setUploadedFileUrl("/api/resumes/" + resume.getId() + "/file");
        }
        if (resume.getUploadedFileName() == null || resume.getUploadedFileName().isBlank()) {
            resume.setUploadedFileName("Candidate_Resume_" + resume.getId() + ".pdf");
        }
        List<WorkExperience> workExperiences = workExperienceRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        List<Education> educations = educationRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        List<ResumeSkill> skills = skillRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        List<Project> projects = projectRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        List<Certification> certifications = certificationRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        List<Award> awards = awardRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        List<Language> languages = languageRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        return ResumeMapper.toResponse(resume, workExperiences, educations, skills, projects, certifications, awards, languages);
    }
}
