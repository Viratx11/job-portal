import React, { useEffect, useState, useRef } from 'react';
import { resumeApi, aiApi, type ResumeResponse, type ResumeTemplate } from '../../services/api';
import { CustomSelect } from '../common/CustomSelect';
import {
  PlusCircle,
  FileText,
  FileCode,
  Award,
  GraduationCap,
  Briefcase,
  Code,
  Globe,
  Upload,
  ExternalLink,
  Trash2,
  CheckCircle2,
  X,
  Download,
  ShieldCheck,
  Link2,
  Sparkles,
  RotateCcw,
  UserCheck,
  Save,
  Palette,
  Eye,
} from 'lucide-react';

function buildFullResumeText(r: ResumeResponse | null): string {
  if (!r) return '';
  const parts: string[] = [];

  const fullName = [r.firstName, r.lastName].filter(Boolean).join(' ').trim();
  const headerLinks = [
    r.email ? `Email: ${r.email}` : '',
    r.phone ? `Phone: ${r.phone}` : '',
    r.linkedinUrl ? `LinkedIn: ${r.linkedinUrl}` : '',
    r.githubUrl ? `GitHub: ${r.githubUrl}` : '',
    r.websiteUrl ? `Website: ${r.websiteUrl}` : '',
    r.portfolioUrl ? `Portfolio: ${r.portfolioUrl}` : '',
  ].filter(Boolean);

  if (fullName || headerLinks.length > 0) {
    parts.push(`${fullName || r.title}\n${headerLinks.join(' | ')}`);
  }

  if (r.skills && r.skills.length > 0) {
    const skillNames = r.skills.map((s: any) => s.skillName || s.name).filter(Boolean);
    if (skillNames.length > 0) {
      parts.push(`TECHNICAL SKILLS:\n${skillNames.join(', ')}`);
    }
  }

  if (r.workExperiences && r.workExperiences.length > 0) {
    const expLines = r.workExperiences.map((w: any) => {
      const period = w.isCurrentJob || w.isCurrent
        ? `${w.startDate || ''} – Present`
        : [w.startDate, w.endDate].filter(Boolean).join(' – ');
      return `• ${w.jobTitle} — ${w.companyName}${period ? ` (${period})` : ''}${w.description ? `\n  ${w.description}` : ''}`;
    });
    parts.push(`WORK EXPERIENCE:\n${expLines.join('\n')}`);
  }

  if (r.projects && r.projects.length > 0) {
    const projLines = r.projects.map((p: any) => {
      const links = [p.githubUrl, p.projectUrl].filter(Boolean).join(' | ');
      return `• ${p.title}${p.technologiesUsed ? ` | Tech: ${p.technologiesUsed}` : ''}${links ? ` (${links})` : ''}${p.description ? `\n  ${p.description}` : ''}`;
    });
    parts.push(`ENGINEERING PROJECTS:\n${projLines.join('\n')}`);
  }

  if (r.educations && r.educations.length > 0) {
    const eduLines = r.educations.map((e: any) => {
      const inst = e.institutionName || e.institution || '';
      const period = [e.startDate, e.endDate].filter(Boolean).join(' – ');
      return `• ${e.degree}${e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ''} — ${inst}${period ? ` (${period})` : ''}${e.grade ? ` [${e.grade}]` : ''}`;
    });
    parts.push(`EDUCATION:\n${eduLines.join('\n')}`);
  }

  if (r.certifications && r.certifications.length > 0) {
    const certLines = r.certifications.map((c: any) => {
      return `• ${c.name || c.title}${c.issuingOrganization ? ` — ${c.issuingOrganization}` : ''}${c.credentialUrl ? ` (${c.credentialUrl})` : ''}`;
    });
    parts.push(`CERTIFICATIONS:\n${certLines.join('\n')}`);
  }

  if (r.awards && r.awards.length > 0) {
    const awardLines = r.awards.map((a: any) => `• ${a.title}${a.description ? ` — ${a.description}` : ''}`);
    parts.push(`HONORS & ACHIEVEMENTS:\n${awardLines.join('\n')}`);
  }

  if (r.summary && r.summary.trim()) {
    parts.push(`RAW EXTRACTED RESUME TEXT & EMBEDDED LINKS:\n${r.summary.trim()}`);
  }

  return parts.join('\n\n');
}

const SAMPLE_LATEX = `\\documentclass[10pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{hyperref}

\\begin{document}
\\begin{center}
    {\\LARGE \\textbf{Alex Morgan}} \\\\
    \\vspace{2pt}
    alex.morgan@example.com $|$ +91 98765 43210 $|$ Bengaluru, India \\\\
    \\href{https://linkedin.com/in/alexmorgan}{linkedin.com/in/alexmorgan} $|$ \\href{https://github.com/alexmorgan}{github.com/alexmorgan}
\\end{center}

\\section*{TECHNICAL SKILLS}
\\textbf{Languages:} Java, TypeScript, Python, Go, SQL \\\\
\\textbf{Frameworks & Backend:} Spring Boot, Node.js, Express, React, Next.js \\\\
\\textbf{Databases & Infrastructure:} PostgreSQL, Redis, Apache Kafka, Docker, Kubernetes, AWS

\\section*{EDUCATION}
\\textbf{National Institute of Technology (NIT), Agartala} \\hfill 2023 -- 2027 \\\\
Bachelor of Technology in Computer Science and Engineering $|$ \\textbf{CGPA: 8.94 / 10.0}

\\section*{WORK EXPERIENCE}
\\textbf{National Informatics Centre (NIC)} \\hfill May 2026 -- July 2026 \\\\
\\textit{Backend Developer Intern}
\\begin{itemize}
    \\item Engineered RESTful APIs in Java Spring Boot with JWT authentication and RBAC.
    \\item Optimized PostgreSQL database queries and indexing, cutting p95 response latency by 35\\%.
\\end{itemize}

\\section*{ENGINEERING PROJECTS}
\\textbf{FluxPay -- Distributed Solana Payment Gateway} $|$ \\href{https://github.com/alexmorgan/fluxpay}{GitHub} \\\\
\\textit{Go, TypeScript, PostgreSQL, Redis, BullMQ}
\\begin{itemize}
    \\item Architected non-custodial payment gateway processing 1,000+ test transactions via Jupiter DEX APIs.
    \\item Designed an asynchronous transaction ledger with PostgreSQL and Redis to guarantee idempotency.
\\end{itemize}

\\end{document}`;

function extractProjectDetailsFromUrl(rawUrl: string): {
  title: string;
  tech: string;
  bullets: string;
  githubUrl?: string;
  liveUrl?: string;
} {
  const url = rawUrl.trim();
  const lower = url.toLowerCase();

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const rawSlug = pathParts.length >= 2
      ? pathParts[pathParts.length - 1]
      : parsed.hostname.split('.')[0];
    const cleanName = rawSlug
      .replace(/[-_]+/g, ' ')
      .replace(/\b(main|master|app|frontend|backend|repo)\b/gi, '')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Engineering Project';

    const isGithub = parsed.hostname.includes('github.com');
    let inferredTech = 'TypeScript, React, Node.js, PostgreSQL';
    let bullets =
      `• Architected and deployed ${cleanName} with modular service boundaries and structured logging.\n` +
      `• Engineered low-latency APIs and optimized database indexing, reducing query response times by 35%.\n` +
      `• Automated containerized testing and CI/CD release workflows for consistent high-availability deployment.`;

    if (
      lower.includes('autodan') ||
      lower.includes('jailbreak') ||
      lower.includes('safety') ||
      lower.includes('red-team') ||
      lower.includes('llm') ||
      lower.includes('adversarial')
    ) {
      inferredTech = 'Python, PyTorch, HuggingFace, Ollama';
      bullets =
        `• Architected ${cleanName} as an automated red-teaming framework for safety evaluation and vulnerability assessment across multimodal AI models.\n` +
        `• Engineered dynamic attacker-judge loops, mechanistic interpretability, and cross-model strategy routing in Python to benchmark LLMs against adversarial prompt vectors.\n` +
        `• Implemented automated matrix benchmarking and modular inference harnesses with Ollama and HuggingFace, scaling experiment evaluation across multimodal targets.`;
    } else if (
      lower.includes('solana') ||
      lower.includes('crypto') ||
      lower.includes('fluxpay') ||
      lower.includes('web3') ||
      lower.includes('payment') ||
      lower.includes('dex')
    ) {
      inferredTech = 'Go, TypeScript, Solana SDK, PostgreSQL, Redis';
      bullets =
        `• Architected non-custodial payment gateway processing token transactions via DEX aggregator APIs.\n` +
        `• Engineered asynchronous transaction ledger and swap pipelines with BullMQ and Redis, cutting perceived confirmation latency by 40%.\n` +
        `• Designed PostgreSQL ledger reconciling on-chain confirmations against merchant balances with ACID guarantees.`;
    } else if (
      lower.includes('data') ||
      lower.includes('analytics') ||
      lower.includes('intelligence') ||
      lower.includes('market') ||
      lower.includes('pipeline')
    ) {
      inferredTech = 'Python, FastAPI, Pandas, Scikit-learn, PostgreSQL';
      bullets =
        `• Cleaned, preprocessed, and structured large-scale real-world datasets into normalized dimensional star schema models.\n` +
        `• Built interactive analytics dashboards with analytical queries cutting p95 query latency by 35%.\n` +
        `• Developed predictive ML risk/classification models with cross-validation achieving robust evaluation benchmarks.`;
    } else if (
      lower.includes('next') ||
      lower.includes('vercel') ||
      lower.includes('react') ||
      lower.includes('frontend')
    ) {
      inferredTech = 'TypeScript, Next.js, React, Node.js, Tailwind CSS';
      bullets =
        `• Architected ${cleanName} as an interactive web platform with responsive server-side rendering.\n` +
        `• Engineered client-side state caching and WebSocket endpoints, achieving sub-200ms page transitions.\n` +
        `• Configured automated deployment with linting, unit testing, and edge CDN asset caching.`;
    } else if (
      lower.includes('spring') ||
      lower.includes('java') ||
      lower.includes('microservice') ||
      lower.includes('kafka')
    ) {
      inferredTech = 'Java, Spring Boot, PostgreSQL, Docker, Redis';
      bullets =
        `• Architected distributed backend microservices using ${inferredTech} with resilient API boundaries.\n` +
        `• Engineered database indexing strategies and asynchronous caching pipelines, reducing p95 latency by 38%.\n` +
        `• Implemented containerized deployment workflows with Docker and continuous integration testing.`;
    }

    return {
      title: cleanName,
      tech: inferredTech,
      githubUrl: isGithub ? parsed.href : undefined,
      liveUrl: !isGithub ? parsed.href : undefined,
      bullets,
    };
  } catch {
    return {
      title: 'Engineering System Project',
      tech: 'Python, FastAPI, PostgreSQL, Docker, Redis',
      bullets:
        '• Designed and implemented scalable backend APIs and responsive frontend workflows.\n' +
        '• Optimized database queries and caching layers to improve throughput and reliability.\n' +
        '• Automated testing harnesses and containerized CI/CD pipelines.',
    };
  }
}

function extractCertDetailsFromUrl(rawUrl: string): {
  name: string;
  issuer: string;
  url: string;
} {
  const url = rawUrl.trim();
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const host = parsed.hostname.replace(/^www\./, '').split('.')[0];
    const issuer = host.charAt(0).toUpperCase() + host.slice(1);
    const slug = parsed.pathname.split('/').filter(Boolean).pop() || 'Credential';
    const title = slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      name: `${issuer} Verified Credential — ${title}`,
      issuer,
      url: parsed.href,
    };
  } catch {
    return {
      name: 'Verified Technical Certification',
      issuer: 'Certification Authority',
      url,
    };
  }
}

export const RESUME_TEMPLATES: {
  id: ResumeTemplate;
  name: string;
  badge: string;
  color: string;
  desc: string;
}[] = [
  {
    id: 'MODERN',
    name: 'Modern Tech',
    badge: 'Popular',
    color: 'from-blue-600 to-indigo-700',
    desc: 'Deep royal blue accents, bold title badge, structured high-impact engineering metrics layout.',
  },
  {
    id: 'PROFESSIONAL',
    name: 'Classic Professional',
    badge: 'Wall Street',
    color: 'from-slate-800 to-slate-900',
    desc: 'Ivy League / Corporate format, centered candidate name, double horizontal rule, classic typography.',
  },
  {
    id: 'MINIMAL',
    name: 'Minimalist Dev',
    badge: 'FAANG Favorite',
    color: 'from-zinc-700 to-zinc-900',
    desc: 'Compact Deedy / Jake\'s resume style, compact margins, ultra-dense project bullets and tech tags.',
  },
  {
    id: 'EXECUTIVE',
    name: 'Executive Lead',
    badge: 'Leadership',
    color: 'from-indigo-900 to-slate-900',
    desc: 'Shaded top banner, dedicated executive profile box with strategic highlights, director/VP focus.',
  },
  {
    id: 'CREATIVE',
    name: 'Creative Studio',
    badge: 'Design & Web3',
    color: 'from-emerald-700 to-teal-800',
    desc: 'Left vertical emerald stripe, teal section headers, modern styled bullet points for product & innovation.',
  },
];

export const ResumeUploadModal: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeResponse | null>(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [applyingTemplate, setApplyingTemplate] = useState(false);
  const [aiFormatting, setAiFormatting] = useState(false);
  const [pdfTimestamp, setPdfTimestamp] = useState(Date.now());
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [newResumeTemplate, setNewResumeTemplate] = useState<ResumeTemplate>('MODERN');

  const [showLatexModal, setShowLatexModal] = useState(false);
  const [latexCode, setLatexCode] = useState(SAMPLE_LATEX);
  const [latexTitle, setLatexTitle] = useState('');
  const [compilingLatex, setCompilingLatex] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('Software Engineer CV');
  const [creatingResume, setCreatingResume] = useState(false);

  const [extractingProject, setExtractingProject] = useState(false);
  const [extractingCert, setExtractingCert] = useState(false);

  const [skillName, setSkillName] = useState('');

  const [expCompany, setExpCompany] = useState('');
  const [expRole, setExpRole] = useState('');
  const [expTechStack, setExpTechStack] = useState('');
  const [expStartMonth, setExpStartMonth] = useState('2026-05');
  const [expEndMonth, setExpEndMonth] = useState('2026-07');
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expDescription, setExpDescription] = useState('');
  const [expDraftingBullets, setExpDraftingBullets] = useState(false);

  const [eduLevel, setEduLevel] = useState('UNDERGRADUATE');
  const [eduSchool, setEduSchool] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduGrade, setEduGrade] = useState('');
  const [eduCoursework, setEduCoursework] = useState('');
  const [eduStartYear, setEduStartYear] = useState('2023');
  const [eduEndYear, setEduEndYear] = useState('2027');

  const [customTemplateContent, setCustomTemplateContent] = useState('');
  const [customTemplateName, setCustomTemplateName] = useState('');
  const customTemplateFileInputRef = useRef<HTMLInputElement | null>(null);

  const [projUrl, setProjUrl] = useState('');
  const [projTitle, setProjTitle] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projDesc, setProjDesc] = useState('');

  const [certUrl, setCertUrl] = useState('');
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [awardTitle, setAwardTitle] = useState('');

  const [langName, setLangName] = useState('');

  const [profileName, setProfileName] = useState('');
  const [profileHeadline, setProfileHeadline] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLinkedin, setProfileLinkedin] = useState('');
  const [profileGithub, setProfileGithub] = useState('');
  const [profilePortfolio, setProfilePortfolio] = useState('');
  const [profileLeetcode, setProfileLeetcode] = useState('');
  const [profileCodeforces, setProfileCodeforces] = useState('');
  const [profileCodechef, setProfileCodechef] = useState('');
  const [profileHackerrank, setProfileHackerrank] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [projLiveUrl, setProjLiveUrl] = useState('');
  const [projGithubUrl, setProjGithubUrl] = useState('');

  const cleanPhone = (raw?: string): string => {
    if (!raw) return '';
    let cleaned = raw.replace(/^(?:India|Bharat|IN|USA|US|UK|Phone|Tel|Mobile|Contact)[\s|:/-]*/i, '').trim();
    if (cleaned.includes('|')) {
      const parts = cleaned.split('|');
      const digitPart = parts.find((p) => /\d{7,}/.test(p));
      if (digitPart) cleaned = digitPart.trim();
    }
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length === 10) return `+91 ${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2)}`;
    return cleaned.replace(/^(?:India|Bharat|IN|USA|US|UK)[\s|:/-]*/i, '').trim();
  };

  const syncProfileInputs = (resume: ResumeResponse | null) => {
    if (!resume) {
      setProfileName('');
      setProfileHeadline('');
      setProfileEmail('');
      setProfilePhone('');
      setProfileLinkedin('');
      setProfileGithub('');
      setProfilePortfolio('');
      setProfileLeetcode('');
      setProfileCodeforces('');
      setProfileCodechef('');
      setProfileHackerrank('');
      return;
    }
    const name = [resume.firstName, resume.lastName].filter(Boolean).join(' ') || '';
    setProfileName(name);
    setProfileHeadline(resume.headline || '');
    setProfileEmail(resume.email || '');
    setProfilePhone(cleanPhone(resume.phone || ''));
    setProfileLinkedin(resume.linkedinUrl || '');
    setProfileGithub(resume.githubUrl || '');
    setProfilePortfolio(resume.portfolioUrl || resume.websiteUrl || '');
    setProfileLeetcode((resume as any).leetcodeUrl || '');
    setProfileCodeforces((resume as any).codeforcesUrl || '');
    setProfileCodechef((resume as any).codechefUrl || '');
    setProfileHackerrank((resume as any).hackerrankUrl || '');
  };

  const handleSaveProfile = async () => {
    if (!activeResume) return;
    setSavingProfile(true);
    try {
      const parts = profileName.trim().split(/\s+/);
      const firstName = parts[0] || 'Candidate';
      const lastName = parts.slice(1).join(' ') || '';
      await resumeApi.updatePersonalInfo(activeResume.id, {
        firstName,
        lastName,
        headline: profileHeadline.trim() || undefined,
        email: profileEmail.trim() || undefined,
        phone: cleanPhone(profilePhone) || undefined,
        linkedinUrl: profileLinkedin.trim() || undefined,
        githubUrl: profileGithub.trim() || undefined,
        websiteUrl: profilePortfolio.trim() || undefined,
        portfolioUrl: profilePortfolio.trim() || undefined,
        leetcodeUrl: profileLeetcode.trim() || undefined,
        codeforcesUrl: profileCodeforces.trim() || undefined,
        codechefUrl: profileCodechef.trim() || undefined,
        hackerrankUrl: profileHackerrank.trim() || undefined,
      });
      setStatus(`Saved personal profile details for "${activeResume.title}". Regenerated ATS PDF!`);
      await loadResumes(activeResume.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update personal info');
    } finally {
      setSavingProfile(false);
    }
  };

  // Full untruncated Resume Analyzer text
  const [rawResumeText, setRawResumeText] = useState('');
  const [aiOutput, setAiOutput] = useState('');

  const loadResumes = async (preferredId?: number) => {
    try {
      const list = await resumeApi.getMyResumes();
      setResumes(list);
      if (list.length > 0) {
        const validCurrentId = list.some((r) => r.id === activeResume?.id) ? activeResume?.id : undefined;
        const targetId =
          preferredId && list.some((r) => r.id === preferredId)
            ? preferredId
            : validCurrentId || list[0].id;
        const full = await resumeApi.getResume(targetId);
        setActiveResume(full);
        syncProfileInputs(full);
        setRawResumeText(buildFullResumeText(full));
      } else {
        setActiveResume(null);
        syncProfileInputs(null);
        setRawResumeText('');
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleCompileLatex = async () => {
    if (!latexCode.trim()) return;
    setCompilingLatex(true);
    try {
      const res = await resumeApi.createFromLatex(latexCode, latexTitle.trim() || undefined);
      setShowLatexModal(false);
      setStatus(`Compiled LaTeX resume "${res.title}" (#${res.id}) — PDF generated & entities extracted!`);
      await loadResumes(res.id);
    } catch (err: any) {
      setStatus(err.response?.data?.message || 'Failed to compile and parse LaTeX resume.');
    } finally {
      setCompilingLatex(false);
    }
  };

  const handleUploadPdfOrTxt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const title = file.name.replace(/\.(pdf|txt|doc|docx)$/i, '');
      const uploaded = await resumeApi.uploadResume(file, title);
      setStatus(
        `Uploaded "${file.name}" as Resume #${uploaded.id} — Extracted ${
          uploaded.skills?.length || 0
        } skills, ${uploaded.projects?.length || 0} projects, and embedded profile URLs automatically!`
      );
      await loadResumes(uploaded.id);
    } catch (err: any) {
      setStatus(err.response?.data?.message || 'Failed to upload resume file.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleExtractProjectAi = async () => {
    if (!projUrl.trim()) return;
    setExtractingProject(true);
    const isGh = projUrl.toLowerCase().includes('github.com');
    if (isGh) {
      setProjGithubUrl(projUrl.trim());
    } else {
      setProjLiveUrl(projUrl.trim());
    }
    try {
      const data = await aiApi.extractProjectAi({ url: projUrl.trim(), description: projDesc.trim() || undefined });
      if (data.title) setProjTitle(data.title);
      if (data.technologiesUsed) setProjTech(data.technologiesUsed);
      if (data.bulletPoints) setProjDesc(data.bulletPoints);
      setStatus(`AI analyzed project at ${projUrl} and generated high-impact engineering bullets!`);
    } catch {
      const fallback = extractProjectDetailsFromUrl(projUrl);
      setProjTitle(fallback.title);
      setProjTech(fallback.tech);
      setProjDesc(fallback.bullets);
      if (fallback.githubUrl && !projGithubUrl) setProjGithubUrl(fallback.githubUrl);
      if (fallback.liveUrl && !projLiveUrl) setProjLiveUrl(fallback.liveUrl);
      setStatus(`Extracted project structure from ${projUrl}`);
    } finally {
      setExtractingProject(false);
    }
  };

  const handleExtractCertAi = async () => {
    if (!certUrl.trim()) return;
    setExtractingCert(true);
    try {
      const data = await aiApi.extractCertAi({ url: certUrl.trim() });
      if (data.certificationName) setCertName(data.certificationName);
      if (data.issuingOrganization) setCertIssuer(data.issuingOrganization);
      setStatus(`AI extracted credential: ${data.certificationName} (${data.issuingOrganization})`);
    } catch {
      const info = extractCertDetailsFromUrl(certUrl);
      setCertName(info.name);
      setCertIssuer(info.issuer);
      setStatus(`Extracted credential details from ${info.issuer}`);
    } finally {
      setExtractingCert(false);
    }
  };

  const handleSelectTemplate = async (tplId: ResumeTemplate) => {
    if (!activeResume) return;
    setApplyingTemplate(true);
    try {
      const updated = await resumeApi.updateResume(activeResume.id, { template: tplId });
      setActiveResume(updated);
      setPdfTimestamp(Date.now());
      setStatus(`Applied ${tplId} template! Live ATS PDF recompiled.`);
      await loadResumes(activeResume.id);
    } catch (err: any) {
      alert('Failed to apply template: ' + (err.response?.data?.message || err.message));
    } finally {
      setApplyingTemplate(false);
    }
  };

  const handleCustomTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      setCustomTemplateContent(content);
      setCustomTemplateName(file.name);
      setStatus(`Uploaded custom template "${file.name}". AI will format and recompile your resume using this template!`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAiFormatWithTemplate = async () => {
    if (!activeResume) return;
    setAiFormatting(true);
    try {
      const instructions = customTemplateContent
        ? `Format and align all content strictly to the uploaded custom template: ${customTemplateContent}. Retain compact 1-page engineering format.`
        : 'Preserve the exact previous resume structure and compact 1-page engineering format. Elevate project and experience bullets into high-impact Google XYZ bullets with metrics.';
      const updated = await resumeApi.formatResumeWithTemplate(activeResume.id, {
        template: activeResume.template || 'PROFESSIONAL',
        customInstructions: instructions,
      });
      setActiveResume(updated);
      syncProfileInputs(updated);
      setPdfTimestamp(Date.now());
      setStatus(
        customTemplateContent
          ? `✨ AI formatted your resume using custom template "${customTemplateName}" and compiled 1-page PDF!`
          : `✨ AI elevated your resume content and preserved single-page Ivy League engineering format!`
      );
      await loadResumes(activeResume.id);
    } catch (err: any) {
      alert('AI Formatting failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setAiFormatting(false);
    }
  };

  const handleCreateNewResume = async () => {
    if (!newResumeTitle.trim()) return;
    setCreatingResume(true);
    try {
      const created = await resumeApi.createResume({
        title: newResumeTitle.trim(),
        template: newResumeTemplate || 'MODERN',
        visibility: 'PUBLIC',
        isDefault: resumes.length === 0,
      });
      setShowCreateModal(false);
      setNewResumeTitle('Software Engineer CV');
      setStatus(`Created new resume "${created.title}" (#${created.id})! Start adding your skills, projects, and experience.`);
      await loadResumes(created.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create resume');
    } finally {
      setCreatingResume(false);
    }
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-2.5 sm:px-6 lg:px-10 py-4 sm:py-7 space-y-4 sm:space-y-6 flex-1 min-w-0 overflow-x-hidden">
      {/* Header Card */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 rounded-xl shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-colors">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Candidate Profile & CV Manager
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Prompt-Injection Guardrail Active
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Resumes & PDF Skill Extractor
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Upload a `.pdf` or `.txt` resume, or compile directly from raw LaTeX code. Automatically extracts skills, projects, embedded URLs, education, and synchronizes your downloadable ATS PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={handleUploadPdfOrTxt}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition flex-1 sm:flex-initial"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading & Parsing PDF...' : 'Upload PDF / TXT'}
          </button>

          <button
            type="button"
            onClick={() => {
              setNewResumeTitle('Software Engineer CV');
              setShowCreateModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition flex-1 sm:flex-initial whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            + Create New Resume
          </button>

          <button
            type="button"
            onClick={() => {
              setLatexCode(SAMPLE_LATEX);
              setLatexTitle('');
              setShowLatexModal(true);
            }}
            className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition flex-1 sm:flex-initial whitespace-nowrap border border-transparent dark:border-slate-700"
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            Create with LaTeX Code
          </button>
        </div>
      </div>

      {status && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> {status}
          </span>
          <button onClick={() => setStatus('')} className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Empty State Hero when 0 resumes */}
      {resumes.length === 0 && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-sm space-y-4">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-400">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Create Your Verified Developer Resume
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Build a resume from scratch by filling your details, compile directly with raw LaTeX code, or upload an existing PDF/TXT resume to auto-extract your skills and projects.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setNewResumeTitle('Software Engineer CV');
                setShowCreateModal(true);
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition"
            >
              <PlusCircle className="w-4 h-4" /> + Create New Resume from Scratch
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition"
            >
              <Upload className="w-4 h-4" /> Upload Existing PDF / TXT
            </button>
            <button
              type="button"
              onClick={() => {
                setLatexCode(SAMPLE_LATEX);
                setLatexTitle('');
                setShowLatexModal(true);
              }}
              className="w-full sm:w-auto bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition border border-transparent dark:border-slate-700"
            >
              <FileCode className="w-4 h-4 text-emerald-400" /> Create with LaTeX Code
            </button>
          </div>
        </div>
      )}

      {/* Active Resume Switcher Bar */}
      {resumes.length > 0 && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">Currently Editing:</span>
              <div className="w-full sm:w-72">
                <CustomSelect
                  value={activeResume?.id || ''}
                  onChange={async (id) => {
                    const full = await resumeApi.getResume(Number(id));
                    setActiveResume(full);
                    syncProfileInputs(full);
                    setRawResumeText(buildFullResumeText(full));
                  }}
                  options={resumes.map((r) => ({
                    value: r.id,
                    label: `${r.title} (#${r.id})`,
                    badge: r.uploadedFileName ? 'PDF' : undefined,
                  }))}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewResumeTitle('Software Engineer CV');
                  setShowCreateModal(true);
                }}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer transition shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" /> + New Resume
              </button>

              {activeResume && (
                <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
                  <a
                    href={resumeApi.getFileUrl(activeResume.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open PDF
                  </a>
                  <a
                    href={resumeApi.getFileUrl(activeResume.id, '?download=true')}
                    className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </a>
                </div>
              )}
            </div>

            {activeResume && (
              <button
                onClick={async () => {
                  const deletedId = activeResume.id;
                  await resumeApi.deleteResume(deletedId);
                  setActiveResume(null);
                  setStatus(`Removed Resume #${deletedId}`);
                  await loadResumes();
                }}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer self-start sm:self-auto transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Resume
              </button>
            )}
          </div>

          {/* Extracted Embedded Links Bar */}
          {activeResume && (activeResume.linkedinUrl || activeResume.githubUrl || activeResume.websiteUrl || activeResume.email) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400">Extracted Profile & Embedded PDF Links:</span>
              {activeResume.email && (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-md font-medium">
                  ✉️ {activeResume.email}
                </span>
              )}
              {activeResume.phone && (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-md font-medium">
                  📞 {activeResume.phone}
                </span>
              )}
              {activeResume.linkedinUrl && (
                <a
                  href={activeResume.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-md font-semibold hover:underline flex items-center gap-1"
                >
                  <Link2 className="w-3 h-3" /> LinkedIn Profile
                </a>
              )}
              {activeResume.githubUrl && (
                <a
                  href={activeResume.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-900 dark:bg-slate-800 text-white px-2.5 py-0.5 rounded-md font-semibold hover:opacity-90 flex items-center gap-1 border border-transparent dark:border-slate-700"
                >
                  <Link2 className="w-3 h-3" /> GitHub ({activeResume.githubUrl.replace('https://github.com/', '')})
                </a>
              )}
              {activeResume.websiteUrl && (
                <a
                  href={activeResume.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-md font-semibold hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Live Portfolio / Demo
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resume Templates & AI Formatting Card */}
      {activeResume && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  ATS Resume Template & Styling
                </h3>
                <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full uppercase">
                  Active: {activeResume.template || 'MODERN'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select an ATS template persona. Your PDF compiles and reflects all experience and projects instantly.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={customTemplateFileInputRef}
                type="file"
                accept=".tex,.txt,.tmpl,.json"
                onChange={handleCustomTemplateUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => customTemplateFileInputRef.current?.click()}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Upload custom .tex or .txt template"
              >
                <Upload className="w-3.5 h-3.5" />
                {customTemplateName ? `Template: ${customTemplateName.slice(0, 14)}...` : 'Upload Custom Template'}
              </button>

              <button
                type="button"
                disabled={aiFormatting || applyingTemplate}
                onClick={handleAiFormatWithTemplate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {aiFormatting ? 'AI Formatting...' : '✨ AI 1-Page Polish'}
              </button>

              <button
                type="button"
                onClick={() => setShowPdfPreview((prev) => !prev)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                {showPdfPreview ? 'Hide PDF Preview' : 'Preview Live PDF'}
              </button>
            </div>
          </div>

          {customTemplateContent && (
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3.5 py-2 text-xs text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Custom template active: <strong>{customTemplateName}</strong> ({customTemplateContent.length} chars). Click "✨ AI 1-Page Polish" to recompile your resume into this template.
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomTemplateContent('');
                  setCustomTemplateName('');
                }}
                className="text-emerald-700 dark:text-emerald-400 hover:text-rose-600 font-bold ml-2 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* 5 Template Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {RESUME_TEMPLATES.map((tpl) => {
              const isSelected = (activeResume.template || 'PROFESSIONAL') === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => !applyingTemplate && handleSelectTemplate(tpl.id)}
                  className={`border rounded-xl p-3.5 cursor-pointer transition relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-600 dark:ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">{tpl.name}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                          {tpl.badge}
                        </span>
                      )}
                    </div>
                    <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${tpl.color}`} />
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{tpl.desc}</p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className={`font-bold ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {isSelected ? 'Active Template' : 'Click to Apply'}
                    </span>
                    <a
                      href={resumeApi.getFileUrl(activeResume.id, '?download=true')}
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Inline Embedded PDF Preview Accordion */}
          {showPdfPreview && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Live Compiled PDF Preview ({activeResume.template || 'MODERN'} Template)
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={resumeApi.getFileUrl(activeResume.id, `?t=${pdfTimestamp}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Fullscreen
                  </a>
                </div>
              </div>
              <div className="w-full h-[520px] bg-slate-900 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                <iframe
                  key={pdfTimestamp}
                  src={resumeApi.getFileUrl(activeResume.id, `?t=${pdfTimestamp}#toolbar=0`)}
                  title="Resume PDF Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Personal Profile & Contact Information Card */}
      {activeResume && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Personal Profile & Contact Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your contact details and embedded links. GemHire synchronizes these across your application submissions and regenerates your ATS PDF.
              </p>
            </div>
            <button
              type="button"
              disabled={savingProfile}
              onClick={handleSaveProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs shrink-0 self-start sm:self-auto"
            >
              <Save className="w-3.5 h-3.5" />
              {savingProfile ? 'Saving & Syncing PDF...' : 'Save Profile & Sync PDF'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Virat Kumar"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">Headline / Target Role</label>
              <input
                type="text"
                value={profileHeadline}
                onChange={(e) => setProfileHeadline(e.target.value)}
                placeholder="e.g. Backend & Systems Engineer"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="viratkumar@example.com"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">LinkedIn Profile URL</label>
              <input
                type="text"
                value={profileLinkedin}
                onChange={(e) => setProfileLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/viratkumar"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">GitHub Profile URL</label>
              <input
                type="text"
                value={profileGithub}
                onChange={(e) => setProfileGithub(e.target.value)}
                placeholder="https://github.com/Cypher-CP0"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">LeetCode Profile URL</label>
              <input
                type="text"
                value={profileLeetcode}
                onChange={(e) => setProfileLeetcode(e.target.value)}
                placeholder="https://leetcode.com/u/viratk11"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">Codeforces Profile URL</label>
              <input
                type="text"
                value={profileCodeforces}
                onChange={(e) => setProfileCodeforces(e.target.value)}
                placeholder="https://codeforces.com/profile/viratx11"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">CodeChef Profile URL</label>
              <input
                type="text"
                value={profileCodechef}
                onChange={(e) => setProfileCodechef(e.target.value)}
                placeholder="https://www.codechef.com/users/viratx11"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">HackerRank Profile URL</label>
              <input
                type="text"
                value={profileHackerrank}
                onChange={(e) => setProfileHackerrank(e.target.value)}
                placeholder="https://www.hackerrank.com/profile/viratx11"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">Live Portfolio / Personal Website</label>
              <input
                type="text"
                value={profilePortfolio}
                onChange={(e) => setProfilePortfolio(e.target.value)}
                placeholder="https://viratkumar.dev"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {activeResume && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 1. Technical Skills */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-2xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Technical Skills ({activeResume.skills?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Combined with your Project technologies when computing your unified match score.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Java, Spring Boot, React, SQL"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && skillName.trim()) {
                    e.preventDefault();
                    await resumeApi.addSkill(activeResume.id, {
                      skillName: skillName.trim(),
                      proficiencyLevel: 'ADVANCED',
                      yearsOfExperience: 2,
                    });
                    setSkillName('');
                    loadResumes(activeResume.id);
                  }
                }}
                className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />
              <button
                onClick={async () => {
                  if (!skillName.trim()) return;
                  await resumeApi.addSkill(activeResume.id, {
                    skillName: skillName.trim(),
                    proficiencyLevel: 'ADVANCED',
                    yearsOfExperience: 2,
                  });
                  setSkillName('');
                  loadResumes(activeResume.id);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs cursor-pointer shadow-2xs transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-60 overflow-y-auto">
              {activeResume.skills?.map((s: any) => (
                <span
                  key={s.id}
                  className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-md text-emerald-900 dark:text-emerald-200 flex items-center gap-1"
                >
                  {s.skillName || s.name}
                  <button
                    onClick={() =>
                      resumeApi.deleteSkill(activeResume.id, s.id).then(() => loadResumes(activeResume.id))
                    }
                    className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 2. Work Experience (with Start Month/Year, Currently Employed, End Month/Year, Tech Stack, Bullets) */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-2xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Work Experience ({activeResume.workExperiences?.length || 0})
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                  placeholder="Company Name (e.g. NIC)"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={expRole}
                  onChange={(e) => setExpRole(e.target.value)}
                  placeholder="Role Title (e.g. Backend Developer Intern)"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <input
                type="text"
                value={expTechStack}
                onChange={(e) => setExpTechStack(e.target.value)}
                placeholder="Tech Stack worked on (e.g. Java, Spring Boot, Redis, Kafka, Docker)"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                    Start Month & Year *
                  </label>
                  <input
                    type="month"
                    value={expStartMonth}
                    onChange={(e) => setExpStartMonth(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                    {expIsCurrent ? 'End Date (Currently Employed)' : 'End Month & Year'}
                  </label>
                  <input
                    type="month"
                    value={expEndMonth}
                    disabled={expIsCurrent}
                    onChange={(e) => setExpEndMonth(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expIsCurrent}
                    onChange={(e) => setExpIsCurrent(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  Currently employed here
                </label>
                <button
                  type="button"
                  disabled={expDraftingBullets}
                  onClick={async () => {
                    setExpDraftingBullets(true);
                    try {
                      const res = await aiApi.generateExperienceBullets({
                        jobTitle: expRole || 'Backend Developer',
                        company: expCompany || 'Engineering Org',
                        techStack: expTechStack || undefined,
                        rawDescription: expDescription || undefined,
                      });
                      if (res?.bullets?.length) {
                        setExpDescription(res.bullets.map((b: string) => `• ${b}`).join('\n'));
                      }
                    } catch {
                      const tech = expTechStack || 'Spring Boot, PostgreSQL, Redis';
                      setExpDescription(
                        `• Engineered production backend microservices using ${tech} at ${expCompany || 'Company'}, reducing API latency by 35%.\n` +
                          `• Architected event-driven pipelines and caching layers with Redis, processing high-throughput traffic reliably.\n` +
                          `• Implemented automated CI/CD workflows and database indexing, accelerating release cycles.`
                      );
                    } finally {
                      setExpDraftingBullets(false);
                    }
                  }}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {expDraftingBullets ? 'Drafting with AI...' : 'Auto-Draft Bullets with AI'}
                </button>
              </div>

              <textarea
                rows={2}
                value={expDescription}
                onChange={(e) => setExpDescription(e.target.value)}
                placeholder="Key engineering impact bullets (optional)..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
              />

              <button
                onClick={async () => {
                  if (!expCompany.trim() || !expRole.trim()) return;
                  const startDate = expStartMonth ? `${expStartMonth}-01` : '2026-05-01';
                  const endDate = !expIsCurrent && expEndMonth ? `${expEndMonth}-28` : null;
                  const techArray = expTechStack
                    ? expTechStack
                        .split(/[,|/]/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : [];
                  await resumeApi.addExperience(activeResume.id, {
                    companyName: expCompany.trim(),
                    jobTitle: expRole.trim(),
                    startDate,
                    endDate,
                    isCurrentJob: expIsCurrent,
                    description: expDescription.trim() || undefined,
                    technologies: techArray.length > 0 ? techArray : undefined,
                  });
                  setExpCompany('');
                  setExpRole('');
                  setExpTechStack('');
                  setExpDescription('');
                  loadResumes(activeResume.id);
                }}
                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition border border-transparent dark:border-slate-700"
              >
                + Add Work Experience
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pt-1">
              {activeResume.workExperiences?.map((w: any) => (
                <div
                  key={w.id}
                  className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 space-y-1"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <strong className="text-slate-900 dark:text-white">{w.jobTitle}</strong> @ {w.companyName}
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {w.startDate ? w.startDate.slice(0, 7) : 'Start'} —{' '}
                        {w.isCurrentJob || w.isCurrent ? 'Present' : w.endDate ? w.endDate.slice(0, 7) : 'Completed'}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        resumeApi.deleteExperience(activeResume.id, w.id).then(() => loadResumes(activeResume.id))
                      }
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                  {w.technologies && w.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {w.technologies.map((t: string, tidx: number) => (
                        <span
                          key={tidx}
                          className="text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-1.5 py-0.2 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {w.description && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed pt-1 border-t border-slate-200/70 dark:border-slate-700/80">
                      {w.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Education (Level Selector, Degree, CGPA / Percentage, Coursework) */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-2xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Education ({activeResume.educations?.length || 0})
            </h3>
            <div className="space-y-2">
              <CustomSelect
                value={eduLevel}
                onChange={(val) => setEduLevel(val)}
                options={[
                  { value: 'UNDERGRADUATE', label: 'Undergraduate (B.Tech / B.E. / B.Sc / BCA)' },
                  { value: 'POST_GRADUATE', label: 'Post-Graduate (M.Tech / M.S. / MBA / MCA)' },
                  { value: 'DIPLOMA', label: 'Diploma / Polytechnic' },
                  { value: 'HIGHER_SECONDARY', label: 'Higher Secondary (Class XII / 12th)' },
                  { value: 'SECONDARY', label: 'Secondary (Class X / 10th)' },
                ]}
              />

              <input
                type="text"
                value={eduSchool}
                onChange={(e) => setEduSchool(e.target.value)}
                placeholder="Institution Name (e.g. NIT Agartala)"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={eduDegree}
                onChange={(e) => setEduDegree(e.target.value)}
                placeholder="Degree & Branch (e.g. B.Tech in Computer Science and Engineering)"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={eduGrade}
                  onChange={(e) => setEduGrade(e.target.value)}
                  placeholder="CGPA / Percentage (e.g. 8.94/10.0 or 89.4%)"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={eduStartYear}
                  onChange={(e) => setEduStartYear(e.target.value)}
                  placeholder="Start Year (2023)"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={eduEndYear}
                  onChange={(e) => setEduEndYear(e.target.value)}
                  placeholder="Grad Year (2027)"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <input
                type="text"
                value={eduCoursework}
                onChange={(e) => setEduCoursework(e.target.value)}
                placeholder="Relevant Coursework (e.g. Data Structures, OS, DBMS, ML, Networks)"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />

              <button
                onClick={async () => {
                  if (!eduSchool.trim() || !eduDegree.trim()) return;
                  await resumeApi.addEducation(activeResume.id, {
                    institutionName: eduSchool.trim(),
                    degree: eduDegree.trim(),
                    grade: eduGrade.trim() || undefined,
                    fieldOfStudy: eduLevel === 'UNDERGRADUATE' ? 'Computer Science & Engineering' : eduLevel.replace('_', ' '),
                    startDate: `${eduStartYear || '2023'}-08-01`,
                    endDate: `${eduEndYear || '2027'}-05-30`,
                    description: eduCoursework.trim() || undefined,
                    isCurrentlyStudying: true,
                  });
                  setEduSchool('');
                  setEduDegree('');
                  setEduGrade('');
                  setEduCoursework('');
                  loadResumes(activeResume.id);
                }}
                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition border border-transparent dark:border-slate-700"
              >
                + Add Education
              </button>
            </div>
            <div className="space-y-1.5 pt-1">
              {activeResume.educations?.map((edu: any) => {
                const cleanInst = (edu.institutionName || edu.institution || '')
                  .replace(/[•·-–|]\s*(?:CGPA|GPA|CPI)?\s*\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?\.?\s*$/i, '')
                  .replace(/[•·-–|.]\s*$/, '')
                  .trim();
                const rawGrade = edu.grade || '';
                const cleanGrade = rawGrade
                  ? rawGrade.toUpperCase().includes('CGPA') || rawGrade.toUpperCase().includes('GPA')
                    ? rawGrade
                    : `CGPA: ${rawGrade}`
                  : '';
                const cleanDegree = (edu.degree || '')
                  .replace(/(?:CGPA|GPA|CPI|Grade)?\s*[:–-]?\s*[0-9]+\.[0-9]+\s*\/\s*[0-9]+(?:\.[0-9]+)?/gi, '')
                  .replace(/\b00\s*\/\s*10(?:\.0)?\b/gi, '')
                  .replace(/[•·-–|]\s*$/, '')
                  .trim() || 'Degree';

                return (
                  <div
                    key={edu.id}
                    className="text-xs text-slate-700 dark:text-slate-300 flex justify-between items-start bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <strong className="text-slate-900 dark:text-white">{cleanDegree}</strong>
                        {cleanGrade && (
                          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                            {cleanGrade}
                          </span>
                        )}
                        {edu.fieldOfStudy ? (
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">({edu.fieldOfStudy})</span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {cleanInst}
                        {edu.startDate && (
                          <span className="ml-1 text-slate-400">
                            • {edu.startDate.slice(0, 4)} – {edu.endDate ? edu.endDate.slice(0, 4) : 'Present'}
                          </span>
                        )}
                      </div>
                      {edu.description && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                          {edu.description}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        resumeApi.deleteEducation(activeResume.id, edu.id).then(() => {
                          setStatus('Removed education & re-synchronized PDF');
                          loadResumes(activeResume.id);
                        })
                      }
                      className="text-slate-400 hover:text-rose-600 cursor-pointer text-sm"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Engineering Projects (Paste URL -> Extract Structured Bullets & Tech Stack) */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-2xs lg:col-span-2 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Engineering Projects ({activeResume.projects?.length || 0})
              </h3>
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
                Included in AI Screening & Cover Letters
              </span>
            </div>

            {/* URL Paste & Auto-Extractor */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg p-3 space-y-2.5">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Paste GitHub Repository or Live Deployment URL to Auto-Extract Project Structure:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={projUrl}
                  onChange={(e) => setProjUrl(e.target.value)}
                  placeholder="https://github.com/username/project-repo or https://project.vercel.app"
                  className="flex-1 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  disabled={extractingProject}
                  onClick={handleExtractProjectAi}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-60 transition shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {extractingProject ? 'AI Analyzing Project...' : 'Extract Bullets from URL (AI)'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="Project Title (e.g. FluxPay — Payment Engine)"
                  className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  placeholder="Tech Stack (e.g. Go, Java, Next.js, PostgreSQL, Redis)"
                  className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="url"
                  value={projLiveUrl}
                  onChange={(e) => setProjLiveUrl(e.target.value)}
                  placeholder="Live Demo URL (e.g. https://fluxpay-landing-page.vercel.app)"
                  className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="url"
                  value={projGithubUrl}
                  onChange={(e) => setProjGithubUrl(e.target.value)}
                  placeholder="GitHub Repo URL (e.g. https://github.com/Cypher-cp0/FluxPay)"
                  className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <textarea
                rows={3}
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                placeholder="Structured engineering bullet points (architecture, scale, database, latency impact)..."
                className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white leading-relaxed"
              />

              <button
                onClick={async () => {
                  if (!projTitle.trim() && !projUrl.trim() && !projGithubUrl.trim()) return;
                  const fallback = projUrl.trim() ? extractProjectDetailsFromUrl(projUrl) : null;
                  const finalTitle = projTitle.trim() || fallback?.title || 'Engineering Project';
                  const finalTech = projTech.trim() || fallback?.tech || '';
                  const finalDesc = projDesc.trim() || fallback?.bullets || '';
                  const isGh = projUrl.toLowerCase().includes('github.com');
                  const git = projGithubUrl.trim() || (isGh ? projUrl.trim() : fallback?.githubUrl);
                  const live = projLiveUrl.trim() || (!isGh && projUrl.trim() ? projUrl.trim() : fallback?.liveUrl);

                  await resumeApi.addProject(activeResume.id, {
                    title: finalTitle,
                    technologiesUsed: finalTech,
                    technologies: finalTech ? finalTech.split(',').map((s) => s.trim()).filter(Boolean) : [],
                    description: finalDesc,
                    githubUrl: git || undefined,
                    sourceCodeUrl: git || undefined,
                    projectUrl: live || undefined,
                    liveUrl: live || undefined,
                  });
                  setProjUrl('');
                  setProjLiveUrl('');
                  setProjGithubUrl('');
                  setProjTitle('');
                  setProjTech('');
                  setProjDesc('');
                  setStatus(`Added project "${finalTitle}" — PDF recompiled & synchronized!`);
                  loadResumes(activeResume.id);
                }}
                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition border border-transparent dark:border-slate-700"
              >
                + Add Structured Project to Resume
              </button>
            </div>

            {/* Existing Structured Projects List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pt-1">
              {activeResume.projects?.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg p-3.5 space-y-1.5 text-xs"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span>{p.title}</span>
                        {p.githubUrl && (
                          <a
                            href={p.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold bg-slate-900 dark:bg-slate-800 text-white px-2 py-0.5 rounded flex items-center gap-1 hover:opacity-90 border border-transparent dark:border-slate-700"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> GitHub Repo
                          </a>
                        )}
                        {p.projectUrl && (
                          <a
                            href={p.projectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded flex items-center gap-1 hover:underline"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Live Demo
                          </a>
                        )}
                      </div>
                      {p.technologiesUsed && (
                        <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                          Stack: {p.technologiesUsed}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        resumeApi.deleteProject(activeResume.id, p.id).then(() => loadResumes(activeResume.id))
                      }
                      className="text-slate-400 hover:text-rose-600 cursor-pointer text-sm font-bold"
                    >
                      ×
                    </button>
                  </div>
                  {p.description && (
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed pt-1 border-t border-slate-200/70 dark:border-slate-700/80">
                      {p.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Certifications & Honors (Paste Credential URL -> Structured Section) + 6. Languages */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-2xs transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Certifications & Coding Profiles
              </h3>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg p-2.5 space-y-2">
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={certUrl}
                    onChange={(e) => setCertUrl(e.target.value)}
                    placeholder="Paste Certificate / LeetCode / Credly URL..."
                    className="flex-1 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    disabled={extractingCert}
                    onClick={handleExtractCertAi}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap disabled:opacity-60 transition"
                  >
                    <Sparkles className="w-3 h-3" /> {extractingCert ? 'Extracting...' : 'Extract URL (AI)'}
                  </button>
                </div>

                <input
                  type="text"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="Certification / Profile Title"
                  className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                  placeholder="Issuing Organization (e.g. AWS, Coursera, LeetCode)"
                  className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <button
                  onClick={async () => {
                    if (!certName.trim() && !certUrl.trim()) return;
                    const fallback = certUrl.trim() ? extractCertDetailsFromUrl(certUrl) : null;
                    await resumeApi.addCertification(activeResume.id, {
                      name: certName.trim() || fallback?.name || 'Verified Certification',
                      issuingOrganization: certIssuer.trim() || fallback?.issuer || 'Verified Issuer',
                      credentialUrl: certUrl.trim() || undefined,
                      issueDate: new Date().toISOString().split('T')[0],
                    });
                    setCertUrl('');
                    setCertName('');
                    setCertIssuer('');
                    setStatus('Added credential — PDF recompiled & synchronized!');
                    loadResumes(activeResume.id);
                  }}
                  className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition border border-transparent dark:border-slate-700"
                >
                  + Add Structured Certification
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={awardTitle}
                  onChange={(e) => setAwardTitle(e.target.value)}
                  placeholder="Honor / Achievement (e.g. Top 3% JEE Mains)"
                  className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <button
                  onClick={async () => {
                    if (!awardTitle.trim()) return;
                    await resumeApi.addAward(activeResume.id, { title: awardTitle.trim() });
                    setAwardTitle('');
                    loadResumes(activeResume.id);
                  }}
                  className="bg-slate-900 dark:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap border border-transparent dark:border-slate-700"
                >
                  + Honor
                </button>
              </div>

              <div className="space-y-1.5 max-h-44 overflow-y-auto pt-1">
                {activeResume.certifications?.map((c: any) => (
                  <div
                    key={`cert-${c.id}`}
                    className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700/80 flex justify-between items-center gap-2"
                  >
                    <div className="truncate">
                      <span className="font-semibold text-slate-900 dark:text-white">{c.name || c.title}</span>
                      {c.issuingOrganization && <span className="text-slate-500 dark:text-slate-400"> • {c.issuingOrganization}</span>}
                      {c.credentialUrl && (
                        <a
                          href={c.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-1.5 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                        >
                          [Verify ↗]
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        resumeApi.deleteCertification(activeResume.id, c.id).then(() => loadResumes(activeResume.id))
                      }
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {activeResume.awards?.map((a: any) => (
                  <div
                    key={`award-${a.id}`}
                    className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50/70 dark:bg-amber-950/40 px-2.5 py-1.5 rounded border border-amber-200 dark:border-amber-800 flex justify-between items-center gap-2"
                  >
                    <span className="font-medium">🏆 {a.title}</span>
                    <button
                      onClick={() =>
                        resumeApi.deleteAward(activeResume.id, a.id).then(() => loadResumes(activeResume.id))
                      }
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Languages */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-2xs transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Spoken Languages ({activeResume.languages?.length || 0})
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={langName}
                  onChange={(e) => setLangName(e.target.value)}
                  placeholder="e.g. English, Hindi"
                  className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <button
                  onClick={async () => {
                    if (!langName.trim()) return;
                    await resumeApi.addLanguage(activeResume.id, {
                      languageName: langName.trim(),
                      proficiency: 'FULL_PROFESSIONAL',
                    });
                    setLangName('');
                    loadResumes(activeResume.id);
                  }}
                  className="bg-slate-900 dark:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer border border-transparent dark:border-slate-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeResume.languages?.map((l: any) => (
                  <span
                    key={l.id}
                    className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                  >
                    {l.languageName}
                    <button
                      onClick={() =>
                        resumeApi.deleteLanguage(activeResume.id, l.id).then(() => loadResumes(activeResume.id))
                      }
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Untruncated Resume Critique & Keyword Inspector */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-2xs transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Complete Resume ATS Keyword, Role Track & Parsed JSON Inspector (Zero Truncation)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Auto-populated with 100% of your resume content, structured projects, work experience, education, and embedded PDF URLs ({rawResumeText.length} characters loaded).
            </p>
          </div>
          {activeResume && (
            <button
              type="button"
              onClick={() => setRawResumeText(buildFullResumeText(activeResume))}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              ↻ Sync Full Text from Active Resume
            </button>
          )}
        </div>
        <textarea
          rows={8}
          value={rawResumeText}
          onChange={(e) => setRawResumeText(e.target.value)}
          placeholder="Upload a resume or select one above to inspect its complete untruncated text, projects, and embedded links..."
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none leading-relaxed"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              const textToAnalyze = rawResumeText.trim() || buildFullResumeText(activeResume);
              if (!textToAnalyze) return;
              const res = await aiApi.getResumeImprovements({ resumeContent: textToAnalyze });
              const strengths = (res.strengths || []).map((s: string) => `✓ ${s}`).join('\n');
              const tips = (res.improvements || [])
                .map((imp: any) => `• [${imp.section}] ${imp.suggestion}`)
                .join('\n');
              setAiOutput(
                `ATS Readiness Score: ${res.overallScore}/100\n${res.summary}\n\nVerified Strengths:\n${strengths}\n\nActionable Improvements:\n${tips}`
              );
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition shadow-2xs"
          >
            Run ATS Critique
          </button>
          <button
            onClick={async () => {
              const textToAnalyze = rawResumeText.trim() || buildFullResumeText(activeResume);
              if (!textToAnalyze) return;
              const res = await aiApi.getCareerFeedback({ resumeContent: textToAnalyze });
              const targets = (res.targetJobs || [])
                .map((t: any) => `• ${t.jobTitle} (${t.skillMatch} Match): ${t.reason}`)
                .join('\n');
              setAiOutput(`${res.overallSummary}\n\nRecommended Role Tracks:\n${targets}`);
            }}
            className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition border border-transparent dark:border-slate-700"
          >
            Role Track Evaluation
          </button>
          <button
            onClick={async () => {
              const textToAnalyze = rawResumeText.trim() || buildFullResumeText(activeResume);
              if (!textToAnalyze) return;
              const res = await aiApi.parseResumeText(textToAnalyze);
              setAiOutput(JSON.stringify(res, null, 2));
            }}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition"
          >
            Inspect Parsed JSON
          </button>
        </div>
        {aiOutput && (
          <pre className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-xs text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[520px] overflow-y-auto">
            {aiOutput}
          </pre>
        )}
      </div>

      {/* Create New Resume Modal Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Create New Resume</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Start with a clean slate and build your ATS PDF vice-versa</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Resume / Profile Title *</label>
              <input
                type="text"
                value={newResumeTitle}
                onChange={(e) => setNewResumeTitle(e.target.value)}
                placeholder="e.g. Backend & Distributed Systems CV"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNewResume();
                }}
              />

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Quick Role Templates
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Backend & Distributed Systems CV',
                    'Full-Stack Platform Engineer CV',
                    'AI / Machine Learning Engineer CV',
                    'Site Reliability & DevOps Engineer CV',
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => setNewResumeTitle(tpl)}
                      className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-medium cursor-pointer transition border border-transparent dark:border-slate-700"
                    >
                      {tpl.replace(' CV', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Resume Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {RESUME_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewResumeTemplate(t.id)}
                      className={`p-2 rounded-lg border text-left text-xs transition cursor-pointer ${
                        newResumeTemplate === t.id
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">{t.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{t.badge}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={creatingResume || !newResumeTitle.trim()}
                onClick={handleCreateNewResume}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition disabled:opacity-50"
              >
                {creatingResume ? 'Creating Resume...' : 'Create & Start Building'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Resume with LaTeX Code Modal */}
      {showLatexModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 transition-colors">
            <div className="bg-slate-900 dark:bg-[#0c111d] text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold">Create Resume with LaTeX Code</h2>
                  <p className="text-[11px] text-slate-300 dark:text-slate-400">
                    Paste raw LaTeX markup. GemHire extracts all entities and compiles a clean, downloadable ATS PDF.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLatexModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resume Title (Optional)
                </label>
                <input
                  type="text"
                  value={latexTitle}
                  onChange={(e) => setLatexTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems & Backend Engineer CV"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    LaTeX Code (<code className="text-blue-600 dark:text-blue-400 font-mono">\documentclass...</code>)
                  </label>
                  <button
                    type="button"
                    onClick={() => setLatexCode(SAMPLE_LATEX)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Sample Template
                  </button>
                </div>
                <textarea
                  rows={13}
                  value={latexCode}
                  onChange={(e) => setLatexCode(e.target.value)}
                  placeholder="Paste your \documentclass... LaTeX code here..."
                  className="w-full font-mono text-xs bg-slate-900 dark:bg-slate-950 text-emerald-300 p-3.5 rounded-lg border border-slate-700 dark:border-slate-800 focus:border-emerald-500 focus:outline-none leading-relaxed"
                  spellCheck={false}
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Our LaTeX parser strips LaTeX commands, extracts contact info, technical skills, university education, work experience, and embedded project links, then renders a parseable ATS-ready PDF.
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 px-5 py-3.5 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowLatexModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={compilingLatex || !latexCode.trim()}
                onClick={handleCompileLatex}
                className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50 border border-transparent dark:border-slate-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {compilingLatex ? 'Compiling LaTeX & Extracting...' : 'Compile LaTeX & Create Resume'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
