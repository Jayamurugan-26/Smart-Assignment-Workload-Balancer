import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  ImageIcon,
  Sparkles,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ArrowRight,
  Eye,
  FileCheck,
  Calendar,
  Layers,
  HelpCircle
} from "lucide-react";
import { api } from "../services/api";

export default function DocumentAnalysisView({ onNotify }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("new"); // "new" or "history"
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.getAnalysisHistory();
      if (res.sessions) {
        setHistoryList(res.sessions);
      }
    } catch (err) {
      console.warn("Could not load history:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.size > 15 * 1024 * 1024) {
      setError("File exceeds maximum allowed size of 15MB.");
      return;
    }

    setFile(selected);
    setError(null);
    setCurrentAnalysis(null);

    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file || analyzing) return;

    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.uploadAndAnalyzeDocument(formData);
      setCurrentAnalysis(res.analysis);
      if (onNotify) {
        onNotify("success", `Completed multimodal analysis for "${file.name}"`, "Analysis Ready");
      }
      fetchHistory();
    } catch (err) {
      setError(err.message || "Failed to analyze document.");
      if (onNotify) onNotify("error", err.message || "Analysis failed", "NEXYRA Error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReopenSession = (session) => {
    setCurrentAnalysis(session.analysis);
    setFile({
      name: session.fileName,
      type: session.fileType,
      size: session.fileSize,
    });
    setPreview(null);
    setActiveTab("new");
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteAnalysisHistory(id);
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
      if (onNotify) onNotify("info", "Analysis session removed from history", "Deleted");
    } catch (err) {
      alert("Failed to delete session: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Photo & Document Analysis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Multimodal deep-learning parsing for assignment instructions, PDF problem sets, rubrics & diagrams
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "new"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "history"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Analysis History ({historyList.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "new" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Upload Box & Progress Pipeline */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Upload Zone */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition text-center flex flex-col items-center justify-center space-y-4 shadow-sm relative">
              <input
                type="file"
                accept="application/pdf,image/*,.docx,.txt"
                onChange={handleFileChange}
                disabled={analyzing}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
              />

              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {file ? file.name : "Choose or drag a document/photo"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports PDF, PNG, JPG, WEBP, DOCX, TXT (up to 15MB)
                </p>
              </div>

              {file && (
                <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "Document"}
                </div>
              )}
            </div>

            {/* Image Preview if applicable */}
            {preview && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black/20 p-2">
                <img src={preview} alt="Upload Preview" className="w-full max-h-48 object-contain rounded-xl" />
              </div>
            )}

            {/* Pipeline Steps Indicator */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Analysis Pipeline
              </span>
              <div className="space-y-2 text-xs">
                <div className={`flex items-center gap-2 ${file ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. File Validated & Stored Safely</span>
                </div>
                <div className={`flex items-center gap-2 ${analyzing ? "text-blue-600 dark:text-blue-400 font-semibold animate-pulse" : currentAnalysis ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"}`}>
                  <Sparkles className="w-4 h-4" />
                  <span>2. NEXYRA Multimodal Decomposition</span>
                </div>
                <div className={`flex items-center gap-2 ${currentAnalysis ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"}`}>
                  <FileCheck className="w-4 h-4" />
                  <span>3. Structured Academic Breakdown</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={!file || analyzing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-40 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Analyzing with NEXYRA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run NEXYRA Analysis</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

          </div>

          {/* Right Column: Structured Results Display */}
          <div className="lg:col-span-7">
            {currentAnalysis ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                
                {/* 1. Summary Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    <FileText className="w-4 h-4" />
                    <span>Executive Summary</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentAnalysis.summary}
                  </p>
                </div>

                {/* 2. Key Points & Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Important Points */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                      📌 Key Points
                    </span>
                    <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                      {currentAnalysis.importantPoints?.map((pt, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-500">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Requirements */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      📋 Requirements
                    </span>
                    <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                      {currentAnalysis.assignmentRequirements?.map((req, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500">✓</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 3. Difficult Sections & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Difficult Sections */}
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      ⚠️ Challenging Areas
                    </span>
                    <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                      {currentAnalysis.difficultSections?.map((diff, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500">!</span>
                          <span>{diff}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Important Dates */}
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                      📅 Critical Dates / Instructions
                    </span>
                    <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                      {currentAnalysis.importantDatesOrInstructions?.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4. Suggested Strategy & Work Breakdown */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                    💡 Suggested Approach
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentAnalysis.suggestedApproach}
                  </p>

                  {/* Phase breakdown */}
                  {currentAnalysis.studyBreakdown && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Work Breakdown Schedule
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {currentAnalysis.studyBreakdown.map((b, i) => (
                          <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
                            <div className="font-bold text-slate-900 dark:text-white">{b.phase}</div>
                            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{b.estimatedHours}h allocated</div>
                            <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              {b.tasks?.map((t, ti) => (
                                <li key={ti}>• {t}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* Empty Placeholder State */
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                  No Document Analyzed Yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Upload an assignment PDF, coursework rubric, or problem set photo on the left to extract requirements and actionable study strategies.
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* HISTORY TAB */
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-500" />
              <span>Past Analysis Sessions</span>
            </h3>

            {loadingHistory ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading analysis sessions...</div>
            ) : historyList.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {historyList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleReopenSession(item)}
                    className="py-3.5 px-3 -mx-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        {item.fileType?.includes("image") ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="truncate text-left">
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                          {item.fileName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{item.sourceType === "CLASSROOM_ATTACHMENT" ? "Classroom Material" : "Uploaded File"}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleReopenSession(item)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition"
                      >
                        Reopen
                      </button>
                      <button
                        onClick={(e) => handleDeleteHistory(item.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No past analysis sessions found. Upload a file or analyze a classroom attachment to start saving history.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
