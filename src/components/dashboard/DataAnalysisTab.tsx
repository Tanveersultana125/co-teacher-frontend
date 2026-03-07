
import { useState } from 'react';
import { Upload, FileText, BarChart3, Users, MessageSquare, AlertCircle, Loader2, Sparkles, X, FileSpreadsheet, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/api/client';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronDown, Download } from 'lucide-react';

export const DataAnalysisTab = () => {
    const [file, setFile] = useState<File | null>(null);
    const [analysisType, setAnalysisType] = useState<string>("class_performance");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [csvData, setCsvData] = useState<string>("");

    const { toast } = useToast();
    const [dragActive, setDragActive] = useState(false);
    const [selectedDetailSubject, setSelectedDetailSubject] = useState<string>("");
    const [selectedImprovementSubject, setSelectedImprovementSubject] = useState<string>("");

    // Chat State for "Ask Questions"
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isChatLoading) return;

        const question = chatInput;
        setChatInput("");
        setChatMessages(prev => [...prev, { role: 'user', content: question }]);
        setIsChatLoading(true);

        try {
            const response = await api.post('/ai/chat-data', {
                question,
                csvData
            });
            setChatMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
        } catch (err: any) {
            console.error(err);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process your request. Please try again." }]);
        } finally {
            setIsChatLoading(false);
        }
    };


    const handleDrag = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: any) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        const validExtensions = ['.csv', '.xlsx', '.xls'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            toast({
                title: "Invalid file type",
                description: "Please upload a CSV or Excel file.",
                variant: "destructive"
            });
            return;
        }
        setFile(file);
        setResult(null);
    };

    const handleAnalyze = async () => {
        if (!file) {
            toast({
                title: "No file selected",
                description: "Please upload a file first.",
                variant: "destructive"
            });
            return;
        }

        setIsAnalyzing(true);

        try {
            let csvData = "";
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

            if (fileExtension === '.csv') {
                // Handle CSV
                csvData = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = (e) => reject(e);
                    reader.readAsText(file);
                });
            } else {
                // Handle Excel
                csvData = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = e.target?.result;
                            if (!data) throw new Error("File reading failed");

                            // Use read with array type for robustness
                            const workbook = XLSX.read(data, { type: 'array' });

                            if (!workbook.SheetNames.length) throw new Error("No sheets found in Excel file");
                            const sheetName = workbook.SheetNames[0];
                            const sheet = workbook.Sheets[sheetName];

                            // Convert to CSV
                            const csv = XLSX.utils.sheet_to_csv(sheet);
                            if (!csv.trim()) throw new Error("Excel sheet appears empty");

                            resolve(csv);
                        } catch (err) {
                            console.error("Excel Parsing Error:", err);
                            reject(err instanceof Error ? err : new Error("Failed to parse Excel file"));
                        }
                    };
                    reader.onerror = (e) => {
                        console.error("FileReader Error:", e);
                        reject(new Error("Failed to read file"));
                    };
                    reader.readAsArrayBuffer(file);
                });
            }

            // Call AI endpoint

            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    title: "Session Expired",
                    description: "Please login again to continue.",
                    variant: "destructive"
                });
                setIsAnalyzing(false);
                return;
            }

            const response = await api.post('/ai/analyze-data', {
                csvData,
                analysisType
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setCsvData(csvData);
            setResult(response.data);


        } catch (error: any) {
            console.error("Analysis error:", error);
            const errorMessage = error.response?.data?.error || error.message || "Something went wrong while processing the file.";
            toast({
                title: "Analysis Failed",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Helper to get subjects list
    const getSubjects = () => result?.subjectInsights ? Object.keys(result.subjectInsights) : [];

    // Auto-select first subject when results load
    if (result && result.subjectInsights && !selectedDetailSubject) {
        const subjects = Object.keys(result.subjectInsights);
        if (subjects.length > 0) {
            if (!selectedDetailSubject) setSelectedDetailSubject(subjects[0]);
            if (!selectedImprovementSubject) setSelectedImprovementSubject(subjects[0]);
        }
    }

    return (
        <div className="flex bg-[#F1F5F9] min-h-screen">
            {/* Left Sidebar for Analysis Type */}
            <div className="w-80 bg-white p-6 flex flex-col gap-8 rounded-r-[2.5rem] my-4 text-slate-900 shadow-2xl border-r border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#6b5ea7]/5 blur-3xl rounded-full -mr-12 -mt-12" />
                <div className="relative z-10">
                    <h3 className="text-xl font-black mb-6 tracking-tight text-slate-900">Analysis Options</h3>

                    <div className="relative">
                        <select
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-[#6b5ea7] text-slate-700 shadow-sm"
                            value="Perform Analysis" // Static for now as per image logic
                            onChange={() => { }}
                        >
                            <option>Perform Analysis</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Choose Analysis Type:</h4>
                    <div className="space-y-3">
                        {[
                            { id: "class_performance", label: "Class Wide Performance Analysis", icon: BarChart3 },
                            { id: "student_performance", label: "Student Wise Performance Analysis", icon: Users },
                            { id: "attendance_analysis", label: "Attendance Analysis", icon: FileText },
                            { id: "ask_questions", label: "Ask Questions To The Data", icon: Mail },
                        ].map((type) => (
                            <label
                                key={type.id}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${analysisType === type.id ? 'bg-[#3d3151] text-white shadow-xl shadow-[#3d3151]/20' : 'hover:bg-white hover:shadow-md bg-white/50 border border-transparent hover:border-slate-200 text-slate-700'}`}
                            >
                                <input
                                    type="radio"
                                    name="analysisType"
                                    value={type.id}
                                    checked={analysisType === type.id}
                                    onChange={(e) => {
                                        setAnalysisType(e.target.value);
                                        setResult(null);
                                    }}
                                    className="hidden"
                                />
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${analysisType === type.id ? 'border-white' : 'border-slate-400'}`}>
                                    {analysisType === type.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className={`text-sm font-bold`}>{type.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-10 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-5xl font-black text-slate-900 tracking-tight font-display mb-3">AI Data Intelligence</h2>
                        <p className="text-slate-500 font-bold">Transform student data into actionable classroom insights</p>
                    </div>


                    {!result && (
                        <div className="space-y-6">
                            {/* Upload Area */}
                            <div className="bg-[#faf9ff] rounded-3xl p-8 shadow-2xl overflow-hidden relative border border-[#6b5ea7]/10">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6b5ea7] via-[#8e82bd] to-[#ec8c6b]"></div>
                                <h3 className="text-slate-900 font-bold mb-4">Upload CSV file with student data</h3>

                                <div
                                    className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center gap-4 transition-all ${dragActive ? 'border-[#6b5ea7] bg-[#6b5ea7]/10' : 'border-slate-300 bg-white/50'}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        id="csv-upload"
                                        accept=".csv, .xlsx, .xls"
                                        className="hidden"
                                        onChange={handleChange}
                                    />

                                    {!file ? (
                                        <>
                                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-slate-500 shadow-sm">
                                                <Upload className="w-8 h-8" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-800 font-bold text-lg">Drag and drop file here</p>
                                                <p className="text-slate-600 text-sm mt-1">Limit 200MB per file • CSV, Excel</p>
                                            </div>
                                            <Button
                                                onClick={() => document.getElementById('csv-upload')?.click()}
                                                variant="outline"
                                                className="bg-transparent border-slate-600 text-slate-800 hover:bg-slate-800 hover:text-white font-bold"
                                            >
                                                Browse files
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                                                <FileSpreadsheet className="w-8 h-8" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-900 font-bold text-lg">{file.name}</p>
                                                <p className="text-slate-600 text-sm mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                                            </div>
                                            <Button
                                                onClick={() => setFile(null)}
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                            >
                                                <X className="w-4 h-4 mr-2" /> Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Instruction Box */}
                            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-rose-700 text-sm font-medium leading-relaxed">
                                    Please upload a CSV or Excel file with the following columns: <span className="font-bold">Roll No, Name, Attendance</span>, and at least one <span className="font-bold">subject column</span> (e.g., Math, Science) to perform accurate analysis.
                                </p>
                            </div>

                            {file && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="h-12 px-8 bg-[#6b5ea7] hover:bg-[#6b5ea7]/90 text-white rounded-xl font-bold text-md shadow-lg"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                Bzzt Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Generate Analysis
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Result Display */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#ebd9ff] text-slate-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden border border-purple-200"
                        >
                            {/* Decorative background glow */}
                            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#6b5ea7]/5 blur-[100px] rounded-full mt-2 shrink-0" />
                            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#ec8c6b]/5 blur-[100px] rounded-full mt-2 shrink-0" />

                            <div className="absolute top-0 right-0 p-6">
                                <Button onClick={() => setResult(null)} variant="ghost" className="text-slate-400 hover:text-slate-900">
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            {/* Fallback for simple markdown response */}
                            {result.analysis && typeof result.analysis === 'string' ? (
                                <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-900">
                                    {result.analysis}
                                </div>
                            ) : (
                                <>
                                    {/* Result Rendering Based on Type */}
                                    <div className="space-y-8">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 border-b border-purple-100 pb-6 relative z-10">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                                                <FileSpreadsheet className="w-5 h-5 text-[#6b5ea7]" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{file?.name}</span>
                                                <span className="text-slate-500 text-xs uppercase tracking-widest font-black">{(file?.size || 0) / 1024 > 1024 ? ((file?.size || 0) / 1024 / 1024).toFixed(2) + ' MB' : ((file?.size || 0) / 1024).toFixed(2) + ' KB'}</span>
                                            </div>
                                        </div>

                                        {/* 1. Student Wise Performance Analysis */}
                                        {(analysisType === "student_performance") && (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                                <h2 className="text-3xl font-bold font-serif mb-4">Student Performance Report</h2>

                                                {/* Toppers Cards */}
                                                <div>
                                                    <h3 className="text-emerald-600 font-bold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5" /> Top Performers</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {result.toppers?.map((student: any, idx: number) => (
                                                            <div key={idx} className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl relative overflow-hidden">
                                                                <div className="absolute top-2 right-2 text-6xl font-black text-emerald-500/10">#{student.rank || idx + 1}</div>
                                                                <p className="text-emerald-700 font-bold text-lg mb-1">{student.name}</p>
                                                                <p className="text-3xl font-black text-slate-900">{student.percentage}%</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Struggling Students */}
                                                <div>
                                                    <h3 className="text-rose-600 font-bold mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Needs Attention</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {result.struggling?.map((student: any, idx: number) => (
                                                            <div key={idx} className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-slate-900 font-bold">{student.name}</p>
                                                                    <p className="text-rose-700 text-sm">Needs help in: {student.needsHelpIn}</p>
                                                                </div>
                                                                <div className="text-2xl font-black text-rose-600">{student.percentage}%</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* All Students Table */}
                                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                                    <h3 className="text-xl font-bold text-slate-900 mb-4">All Students</h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left text-sm text-slate-600">
                                                            <thead className="text-xs uppercase bg-white text-slate-500 font-bold border-b border-slate-200">
                                                                <tr>
                                                                    <th className="px-4 py-3 rounded-l-lg">Name</th>
                                                                    <th className="px-4 py-3">Total Marks</th>
                                                                    <th className="px-4 py-3">Percentage</th>
                                                                    <th className="px-4 py-3">Grade</th>
                                                                    <th className="px-4 py-3 rounded-r-lg">Remarks</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {result.allStudents?.map((student: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-white transition-colors">
                                                                        <td className="px-4 py-3 font-bold text-slate-900">{student.name}</td>
                                                                        <td className="px-4 py-3 text-slate-700">{student.total}</td>
                                                                        <td className={`px-4 py-3 font-bold ${student.percentage >= 75 ? 'text-emerald-600' : student.percentage < 40 ? 'text-rose-600' : 'text-amber-600'}`}>
                                                                            {student.percentage}%
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <span className={`px-2 py-1 rounded-md text-xs font-black ${student.grade === 'A' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                                                                                {student.grade}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3 italic text-slate-500">{student.remarks}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                                {/* 2. Attendance Analysis */}
                                                {(analysisType === "attendance_analysis") && (
                                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                                        <h2 className="text-3xl font-bold font-serif mb-4 text-slate-900">Attendance Analysis</h2>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="bg-white border border-purple-100 p-8 rounded-3xl text-center shadow-sm">
                                                                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-2">Overall Class Attendance</p>
                                                                <p className="text-5xl font-black text-[#6b5ea7]">{result.overallAttendance}%</p>
                                                            </div>
                                                            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl flex items-center justify-center">
                                                                <p className="text-slate-600 font-medium italic text-center">"{result.correlation}"</p>
                                                            </div>
                                                        </div>

                                                        {/* Low Attendance List */}
                                                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
                                                            <h3 className="text-rose-600 font-bold mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Critical Low Attendance ({'<'}75%)</h3>
                                                            <div className="space-y-3">
                                                                {result.lowAttendanceList?.length > 0 ? (
                                                                    result.lowAttendanceList.map((student: any, idx: number) => (
                                                                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-rose-100">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-black text-xs">!</div>
                                                                                <span className="font-bold text-slate-900">{student.name}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-4">
                                                                                <span className="text-rose-600 font-bold">{student.attendance}%</span>
                                                                                <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-500 font-medium">{student.performanceStatus}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-emerald-600 font-medium py-4 text-center">No students have critically low attendance! 🎉</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Insights */}
                                                        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                                                            <h3 className="font-bold text-slate-900 mb-4">Key Insights</h3>
                                                            <ul className="space-y-2">
                                                                {result.insights?.map((insight: string, idx: number) => (
                                                                    <li key={idx} className="flex items-start gap-2 text-slate-600">
                                                                        <div className="w-1.5 h-1.5 bg-[#6b5ea7] rounded-full mt-2 shrink-0" />
                                                                        {insight}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                            </div>
                                        )}

                                        {/* 3. Ask Questions (Chat) */}
                                        {(analysisType === "ask_questions") && (
                                            <div className="h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-4">
                                                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-200">
                                                    {/* Initial Context Summary */}
                                                    {result.summary && (
                                                        <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl mb-4">
                                                            <p className="text-purple-700 text-sm font-medium"><Sparkles className="w-4 h-4 inline mr-2" />AI Data Context:</p>
                                                            <p className="text-slate-900 text-sm mt-1">{result.summary}</p>
                                                        </div>
                                                    )}

                                                    {chatMessages.map((msg, idx) => (
                                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-[#6b5ea7] shadow-lg rounded-tr-none' : 'bg-white rounded-tl-none border border-slate-200'}`}>
                                                                <p className={`text-base font-bold ${msg.role === 'user' ? 'text-white' : 'text-slate-900'}`}>{msg.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {isChatLoading && (
                                                        <div className="flex justify-start">
                                                            <div className="bg-white rounded-2xl p-4 rounded-tl-none flex items-center gap-2 border border-slate-200">
                                                                <Loader2 className="w-4 h-4 animate-spin text-[#6b5ea7]" />
                                                                <span className="text-sm font-bold text-slate-700">AI is analyzing your data...</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-white border-2 border-slate-300 rounded-xl py-4 pl-6 pr-14 text-slate-900 font-bold focus:ring-2 focus:ring-[#6b5ea7] placeholder:text-slate-500"
                                                        placeholder="Type your question here..."
                                                        value={chatInput}
                                                        onChange={(e) => setChatInput(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleSendMessage();
                                                            }
                                                        }}

                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <Button
                                                            size="icon"
                                                            className="h-10 w-10 rounded-lg bg-[#6b5ea7] hover:bg-[#6b5ea7]/90"
                                                            onClick={handleSendMessage}
                                                            disabled={isChatLoading || !chatInput.trim()}
                                                        >
                                                            <Sparkles className="w-5 h-5 text-white" />
                                                        </Button>
                                                    </div>

                                                </div>
                                            </div>
                                        )}

                                        {/* 4. Class Performance (Default Fallback) */}
                                        {((analysisType === "class_performance" || (!["student_performance", "attendance_analysis", "ask_questions"].includes(analysisType))) && result.subjectInsights) && (
                                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                                                {/* 1. Subjects Analysis */}
                                                <div>
                                                    <h2 className="text-3xl font-bold font-serif mb-8 text-slate-900">Class-wide Analysis</h2>

                                                    <h3 className="text-xl font-bold text-slate-700 font-serif mb-4">Subjects Analysis</h3>

                                                    <div className="space-y-6">
                                                        <div>
                                                            <p className="text-emerald-600 font-medium mb-3">Subjects where students are performing well:</p>
                                                            <ul className="space-y-2">
                                                                {result.summary?.performingWell?.map((item: any, idx: number) => (
                                                                    <li key={idx} className="flex items-center gap-2 text-slate-600">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                        {item.subject}: <span className="text-slate-900 font-bold">{item.score}/100</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        <div>
                                                            <p className="text-rose-600 font-medium mb-3">Subjects where students are struggling:</p>
                                                            <ul className="space-y-2">
                                                                {result.summary?.struggling?.map((item: any, idx: number) => (
                                                                    <li key={idx} className="flex items-center gap-2 text-slate-600">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                                        {item.subject}: <span className="text-slate-900 font-bold">{item.score}/100</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2. Class Subject Performance */}
                                                <div className="relative z-10">
                                                    <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200 mb-8 shadow-sm">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                                                {selectedImprovementSubject ? `${selectedImprovementSubject} Analytics` : "Class Performance Analytics"}
                                                            </h3>
                                                            <div className="relative min-w-[300px]">
                                                                <select
                                                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 appearance-none cursor-pointer focus:ring-2 focus:ring-[#6b5ea7] transition-all font-bold text-sm shadow-sm"
                                                                    value={selectedImprovementSubject}
                                                                    onChange={(e) => setSelectedImprovementSubject(e.target.value)}
                                                                >
                                                                    <option value="" className="bg-white">Overall Class Performance</option>
                                                                    {getSubjects().map(sub => <option key={sub} value={sub} className="bg-white">{sub}</option>)}
                                                                </select>
                                                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                                            <div className="bg-white rounded-[2rem] p-8 text-center shadow-sm border border-slate-100 hover:translate-y-[-4px] transition-transform duration-300">
                                                                <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] mb-3">Average Score</p>
                                                                <p className="text-6xl font-black text-slate-900">
                                                                    {selectedImprovementSubject && result.subjectInsights?.[selectedImprovementSubject]
                                                                        ? result.subjectInsights[selectedImprovementSubject].average
                                                                        : result.overallStats?.average}
                                                                </p>
                                                            </div>
                                                            <div className="bg-[#6b5ea7] rounded-[2rem] p-8 text-center shadow-lg border border-[#6b5ea7]/20 hover:translate-y-[-4px] transition-transform duration-300">
                                                                <p className="text-purple-100 font-black text-[11px] uppercase tracking-[0.2em] mb-3">Highest Score</p>
                                                                <p className="text-6xl font-black text-white">
                                                                    {selectedImprovementSubject && result.subjectInsights?.[selectedImprovementSubject]
                                                                        ? result.subjectInsights[selectedImprovementSubject].highest
                                                                        : result.overallStats?.highest?.toFixed(1)}
                                                                </p>
                                                            </div>
                                                            <div className="bg-white rounded-[2rem] p-8 text-center shadow-sm border border-slate-100 hover:translate-y-[-4px] transition-transform duration-300">
                                                                <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] mb-3">Lowest Score</p>
                                                                <p className="text-6xl font-black text-slate-900">
                                                                    {selectedImprovementSubject && result.subjectInsights?.[selectedImprovementSubject]
                                                                        ? result.subjectInsights[selectedImprovementSubject].lowest
                                                                        : result.overallStats?.lowest?.toFixed(1)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {selectedImprovementSubject && result.subjectInsights?.[selectedImprovementSubject] && (
                                                            <div className="animate-in fade-in slide-in-from-top-4 pt-10 border-t border-slate-200">
                                                                <div className="flex items-center gap-3 mb-8">
                                                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#6b5ea7] border border-purple-100">
                                                                        <Sparkles className="w-5 h-5" />
                                                                    </div>
                                                                    <h4 className="font-black text-slate-900 text-xl tracking-tight">
                                                                        Actionable Recommendations
                                                                    </h4>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {result.subjectInsights[selectedImprovementSubject].suggestions.map((suggestion: string, idx: number) => (
                                                                        <div key={idx} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-colors">
                                                                            <div className="text-[#6b5ea7] font-black text-sm mt-1">0{idx + 1}</div>
                                                                            <span className="text-slate-700 leading-relaxed font-medium">{suggestion}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>


                                                {/* 3. Subject-wise Detailed Analysis */}
                                                <div className="pt-8 border-t border-slate-200">
                                                    <h3 className="text-2xl font-bold font-serif mb-6 text-slate-900">Subject-wise Performance Analysis</h3>

                                                    <div className="flex flex-col md:flex-row md:items-center justify-start gap-4 mb-2">
                                                        <p className="text-slate-500 font-bold text-sm">Select a subject to analyze:</p>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                                        <div className="relative w-full md:w-full">
                                                            <select
                                                                className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-slate-900 appearance-none cursor-pointer focus:ring-2 focus:ring-[#6b5ea7] font-bold shadow-sm"
                                                                value={selectedDetailSubject}
                                                                onChange={(e) => setSelectedDetailSubject(e.target.value)}
                                                            >
                                                                {getSubjects().map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                                            </select>
                                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                        </div>
                                                    </div>

                                                    {selectedDetailSubject && result.subjectInsights?.[selectedDetailSubject] && (
                                                        <>
                                                            <p className="text-slate-600 font-medium mb-6">
                                                                Class Average for {selectedDetailSubject}: <span className="text-slate-900 font-bold">{result.subjectInsights[selectedDetailSubject].average}/100</span>
                                                            </p>

                                                            <div className="bg-white rounded-2xl p-6 text-slate-900 mb-8">
                                                                <h4 className="text-lg font-bold text-center mb-6">Distribution of Marks in {selectedDetailSubject}</h4>

                                                                <div className="h-[300px] w-full">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <BarChart data={result.subjectInsights[selectedDetailSubject].distribution}>
                                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                            <XAxis dataKey="range" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                                            <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                                            <Tooltip
                                                                                cursor={{ fill: '#f1f5f9' }}
                                                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                                            />
                                                                            <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={50} activeBar={{ fill: '#9333ea' }} />
                                                                        </BarChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                            </div>

                                                            {/* Bottom Stats for Subject */}
                                                            <div className="space-y-6">
                                                                <p className="text-slate-600 font-medium">
                                                                    Number of students needing improvement in {selectedDetailSubject}: <span className="text-slate-900 font-bold">{
                                                                        result.subjectInsights[selectedDetailSubject].distribution
                                                                            .filter((d: any) => ['0-20', '21-40', '41-60'].some(r => d.range.includes(r)))
                                                                            .reduce((acc: number, curr: any) => acc + curr.count, 0)
                                                                    }</span>
                                                                </p>

                                                                <h4 className="text-2xl font-bold text-slate-900 font-serif">{selectedDetailSubject} Performance Summary</h4>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="bg-slate-50 text-slate-900 rounded-xl p-8 text-center border border-slate-200 shadow-sm">
                                                                        <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2">Average</p>
                                                                        <p className="text-4xl font-black">{result.subjectInsights[selectedDetailSubject].average}</p>
                                                                    </div>
                                                                    <div className="bg-[#6F8F72] text-white rounded-xl p-8 text-center shadow-md">
                                                                        <p className="text-slate-100 font-bold text-sm uppercase tracking-wider mb-2">Highest</p>
                                                                        <p className="text-4xl font-black">{result.subjectInsights[selectedDetailSubject].highest}</p>
                                                                    </div>
                                                                    <div className="bg-white text-slate-900 rounded-xl p-8 text-center border border-slate-100 shadow-sm">
                                                                        <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2">Lowest</p>
                                                                        <p className="text-4xl font-black">{result.subjectInsights[selectedDetailSubject].lowest}</p>
                                                                    </div>
                                                                </div>

                                                                <Button
                                                                    className="bg-[#6b5ea7] hover:bg-[#5a4d8c] text-white px-6 py-6 h-auto rounded-xl font-bold text-lg shadow-lg"
                                                                    onClick={() => {
                                                                        const blob = new Blob([JSON.stringify(result.subjectInsights[selectedDetailSubject], null, 2)], { type: 'application/json' });
                                                                        const url = URL.createObjectURL(blob);
                                                                        const a = document.createElement('a');
                                                                        a.href = url;
                                                                        a.download = `${selectedDetailSubject}_insights.json`;
                                                                        document.body.appendChild(a);
                                                                        a.click();
                                                                        document.body.removeChild(a);
                                                                        URL.revokeObjectURL(url);
                                                                    }}
                                                                >
                                                                    Download {selectedDetailSubject} Insights
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* 4. Overall Plan */}
                                                <div className="pt-10 border-t border-slate-200 mt-10 relative z-10">
                                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Overall Class Strategy Plan</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                                        {result.improvementPlan?.map((plan: string, idx: number) => (
                                                            <div key={idx} className="p-8 bg-slate-50 border border-slate-200 rounded-3xl group hover:border-purple-200 transition-all hover:scale-[1.01] duration-300">
                                                                <div className="flex items-start gap-5">
                                                                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6b5ea7] flex items-center justify-center shrink-0 font-black text-xs border border-purple-200">{idx + 1}</div>
                                                                    <span className="text-slate-700 font-medium text-lg leading-relaxed">{plan}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        onClick={() => {
                                                            const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                                                            const url = URL.createObjectURL(blob);
                                                            const a = document.createElement('a');
                                                            a.href = url;
                                                            a.download = `${file?.name.split('.')[0]}_analysis_report.json`;
                                                            document.body.appendChild(a);
                                                            a.click();
                                                            document.body.removeChild(a);
                                                            URL.revokeObjectURL(url);
                                                        }}
                                                        className="w-full bg-[#6b5ea7] text-white hover:bg-[#5a4d8c] h-20 rounded-[1.5rem] font-black text-xl transition-all shadow-xl group"
                                                    >
                                                        <Download className="w-6 h-6 mr-3 group-hover:translate-y-0.5 transition-transform" />
                                                        Export Professional Report
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>

    );
};
