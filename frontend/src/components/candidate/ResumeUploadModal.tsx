import React, { useEffect, useState } from 'react';
import { resumeApi, aiApi, type ResumeResponse } from '../../services/api';
import { Sparkles, Plus, FileText, Award, GraduationCap, Briefcase, Code, Globe } from 'lucide-react';

export const ResumeUploadModal: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeResponse | null>(null);
  const [newTitle, setNewTitle] = useState('Full-Stack & Distributed Systems Resume');
  const [status, setStatus] = useState('');

  // Sub-item inputs
  const [skillName, setSkillName] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expRole, setExpRole] = useState('');
  const [eduSchool, setEduSchool] = useState('NIT Agartala');
  const [eduDegree, setEduDegree] = useState('B.Tech Computer Science');
  const [projTitle, setProjTitle] = useState('');
  const [certName, setCertName] = useState('');
  const [awardTitle, setAwardTitle] = useState('');
  const [langName, setLangName] = useState('English');

  // AI Career Coach
  const [rawResumeText, setRawResumeText] = useState('');
  const [aiOutput, setAiOutput] = useState('');

  const loadResumes = async () => {
    try {
      const list = await resumeApi.getMyResumes();
      setResumes(list);
      if (list.length > 0) {
        const full = await resumeApi.getResume(list[0].id);
        setActiveResume(full);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleCreateResume = async () => {
    try {
      const created = await resumeApi.createResume({
        title: newTitle,
        template: 'MODERN',
        visibility: 'PUBLIC',
        isDefault: true,
      });
      setStatus(`Created Resume "${created.title}" (#${created.id})`);
      loadResumes();
    } catch {
      setStatus('Failed to create resume. Make sure ai-worker-service (:8081) is running.');
    }
  };

return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Resume Builder & AI Career Coach</h1>
          <p className="text-xs text-slate-400">
            Powered by `ai-worker-service` (:8081) — Resumes, Skills, Projects, Experience & AI Feedback
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 flex-1 sm:w-64"
          />
          <button
            onClick={handleCreateResume}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create Resume
          </button>
        </div>
      </div>

      {status && (
        <div className="bg-indigo-950/60 border border-indigo-800 text-indigo-200 p-3 rounded-xl text-xs">
          {status}
        </div>
      )}

      {activeResume && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Skills (/api/resumes/{id}/skills) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-indigo-400" /> Resume Skills ({activeResume.skills?.length || 0})
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. C++, Spring Boot, React"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              />
              <button
                onClick={async () => {
                  if (!skillName) return;
                  await resumeApi.addSkill(activeResume.id, {
                    skillName,
                    proficiencyLevel: 'ADVANCED',
                    yearsOfExperience: 2,
                  });
                  setSkillName('');
                  loadResumes();
                }}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeResume.skills?.map((s: any) => (
                <span key={s.id} className="text-[11px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md text-indigo-300">
                  {s.skillName}
                </span>
              ))}
            </div>
          </div>
	  
	  {/* Work Experience (/api/resumes/{id}/work-experiences) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-amber-400" /> Experience ({activeResume.workExperiences?.length || 0})
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                value={expCompany}
                onChange={(e) => setExpCompany(e.target.value)}
                placeholder="Company Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={expRole}
                  onChange={(e) => setExpRole(e.target.value)}
                  placeholder="Role Title"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
                <button
                  onClick={async () => {
                    if (!expCompany || !expRole) return;
                    await resumeApi.addExperience(activeResume.id, {
                      companyName: expCompany,
                      jobTitle: expRole,
                      startDate: '2025-05-01',
                      isCurrentJob: true,
                    });
                    setExpCompany('');
                    setExpRole('');
                    loadResumes();
                  }}
                  className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
            {activeResume.workExperiences?.map((w: any) => (
              <p key={w.id} className="text-xs text-slate-300">
                • {w.jobTitle} @ {w.companyName}
              </p>
            ))}
          </div>

          {/* Projects, Certifications, Awards & Languages */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" /> Projects ({activeResume.projects?.length || 0})
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={projTitle}
                onChange={(e) => setProjTitle(e.target.value)}
                placeholder="Project Title"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              />
              <button
                onClick={async () => {
                  if (!projTitle) return;
                  await resumeApi.addProject(activeResume.id, { title: projTitle });
                  setProjTitle('');
                  loadResumes();
                }}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                Add
              </button>
            </div>
            {activeResume.projects?.map((p: any) => (
              <p key={p.id} className="text-xs text-slate-300">• {p.title}</p>
            ))}
          </div>

	  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-rose-400" /> Certifications & Awards
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                placeholder="Certification or Award"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              />
              <button
                onClick={async () => {
                  if (!certName) return;
                  await resumeApi.addAward(activeResume.id, { title: certName });
                  setCertName('');
                  loadResumes();
                }}
                className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                Add
              </button>
            </div>
            {activeResume.awards?.map((a: any) => (
              <p key={a.id} className="text-xs text-slate-300">• {a.title}</p>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" /> Languages ({activeResume.languages?.length || 0})
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={langName}
                onChange={(e) => setLangName(e.target.value)}
                placeholder="Language"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              />
              <button
                onClick={async () => {
                  if (!langName) return;
                  await resumeApi.addLanguage(activeResume.id, {
                    languageName: langName,
                    proficiency: 'FULL_PROFESSIONAL',
                  });
                  setLangName('');
                  loadResumes();
                }}
                className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                Add
              </button>
            </div>
            {activeResume.languages?.map((l: any) => (
              <p key={l.id} className="text-xs text-slate-300">• {l.languageName}</p>
            ))}
          </div>
        </div>
      )}

      {/* AI Resume Analyzer (/api/ai/resume/*) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" /> AI Resume Parser, Improvement & Career Feedback
        </h2>
        <textarea
          rows={3}
          value={rawResumeText}
          onChange={(e) => setRawResumeText(e.target.value)}
          placeholder="Paste raw resume text or project experience here to run AI Parse, Improvement Tips, or Career Feedback..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              if (!rawResumeText) return;
              const res = await aiApi.parseResumeText(rawResumeText);
              setAiOutput(JSON.stringify(res, null, 2));
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
          >
            AI Parse Resume JSON
          </button>
          <button
            onClick={async () => {
              if (!rawResumeText) return;
              const res = await aiApi.getResumeImprovements({ resumeContent: rawResumeText });
              setAiOutput(`Score: ${res.overallScore}/100\nSummary: ${res.summary}`);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
          >
            AI Improvement Score
          </button>
          <button
            onClick={async () => {
              if (!rawResumeText) return;
              const res = await aiApi.getCareerFeedback({ resumeContent: rawResumeText });
              setAiOutput(`Profile Strength: ${res.profileStrength}/100\n${res.overallSummary}`);
            }}
            className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
          >
            AI Career Feedback
          </button>
        </div>
        {aiOutput && (
          <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-indigo-200 overflow-x-auto whitespace-pre-wrap">
            {aiOutput}
          </pre>
        )}
      </div>
    </div>
  );
};