import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Search, Filter, BookOpen, Calendar, ArrowRight, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";


// Mock data for previous papers
const MOCK_PAPERS = [
    {
        id: 1,
        title: "Mathematics Final Exam 2023",
        curriculum: "CBSE",
        grade: "10",
        subject: "Mathematics",
        year: "2023",
        downloads: 1240,
        questions: [
            { id: 1, text: "Calculate the roots of the quadratic equation: 2x² - 7x + 3 = 0", marks: 3 },
            { id: 2, text: "Prove that √5 is an irrational number.", marks: 4 },
            { id: 3, text: "Find the sum of the first 20 terms of the AP: 1, 4, 7, 10...", marks: 3 },
            { id: 4, text: "A tower stands vertically on the ground. From a point on the ground, which is 15m away from the foot of the tower, the angle of elevation is 60°. Find the height of the tower.", marks: 5 }
        ]
    },
    {
        id: 19,
        title: "Grade 10 Urdu Adab 2023",
        curriculum: "SSC",
        grade: "10",
        subject: "Urdu",
        year: "2023",
        downloads: 320,
        questions: [
            { id: 1, text: "Mir Taqi Mir ki ghazal goi par note likhiye.", marks: 5 },
            { id: 2, text: "Darj zail ashaar ki tashreeh kijiye:", marks: 4 },
            { id: 3, text: "Mundarja zail alfaz ke maani likhiye: (a) Muntazir (b) Aarzoo", marks: 2 }
        ]
    },
    { id: 2, title: "Science Mid-Term 2023", curriculum: "CBSE", grade: "10", subject: "Science", year: "2023", downloads: 980 },
    { id: 3, title: "English Language Paper 1", curriculum: "ICSE", grade: "10", subject: "English", year: "2022", downloads: 850 },
    { id: 4, title: "Physics Theory 2022", curriculum: "CBSE", grade: "12", subject: "Physics", year: "2022", downloads: 2100 },
    { id: 5, title: "Chemistry Practical Board Exam", curriculum: "CBSE", grade: "12", subject: "Chemistry", year: "2023", downloads: 1800 },
    { id: 6, title: "History & Civics 2021", curriculum: "ICSE", grade: "9", subject: "Social Studies", year: "2021", downloads: 670 },
    { id: 8, title: "SSC Mathematics Geometry", curriculum: "SSC", grade: "10", subject: "Mathematics", year: "2023", downloads: 3400 },
    { id: 9, title: "Computer Science Python", curriculum: "CBSE", grade: "11", subject: "Computer Science", year: "2023", downloads: 900 },
    { id: 10, title: "Environmental Science", curriculum: "ICSE", grade: "10", subject: "EVS", year: "2022", downloads: 560 },
    { id: 11, title: "Grade 5 Mathematics Annual", curriculum: "CBSE", grade: "5", subject: "Mathematics", year: "2023", downloads: 450 },
    { id: 12, title: "Grade 3 EVS Worksheet", curriculum: "CBSE", grade: "3", subject: "EVS", year: "2023", downloads: 320 },
    { id: 13, title: "Grade 1 English Alphabet", curriculum: "ICSE", grade: "1", subject: "English", year: "2023", downloads: 890 },
    { id: 14, title: "Grade 8 Science Mid-Term", curriculum: "SSC", grade: "8", subject: "Science", year: "2022", downloads: 600 },
    { id: 15, title: "Grade 6 Social Studies", curriculum: "CBSE", grade: "6", subject: "Social Studies", year: "2023", downloads: 510 },
    { id: 16, title: "Grade 4 Hindi Vyakaran", curriculum: "CBSE", grade: "4", subject: "Hindi", year: "2022", downloads: 210 },
    { id: 17, title: "Grade 2 Math Fun", curriculum: "ICSE", grade: "2", subject: "Mathematics", year: "2023", downloads: 440 },
    { id: 18, title: "Grade 7 Sanskrit Prathama", curriculum: "CBSE", grade: "7", subject: "Sanskrit", year: "2022", downloads: 150 },
    { id: 19, title: "Grade 10 Urdu Adab 2023", curriculum: "SSC", grade: "10", subject: "Urdu", year: "2023", downloads: 320 },
    { id: 20, title: "Grade 8 Telugu Sahityam", curriculum: "SSC", grade: "8", subject: "Telugu", year: "2022", downloads: 280 },
    { id: 21, title: "Grade 5 Urdu Nazm", curriculum: "CBSE", grade: "5", subject: "Urdu", year: "2023", downloads: 190 },
    { id: 22, title: "Grade 9 Telugu Vyakaranamu", curriculum: "SSC", grade: "9", subject: "Telugu", year: "2023", downloads: 410 },
    { id: 19, title: "Grade 10 Urdu Adab 2023", curriculum: "SSC", grade: "10", subject: "Urdu", year: "2023", downloads: 320 },
    { id: 20, title: "Grade 8 Telugu Sahityam", curriculum: "SSC", grade: "8", subject: "Telugu", year: "2022", downloads: 280 },
    { id: 21, title: "Grade 5 Urdu Nazm", curriculum: "CBSE", grade: "5", subject: "Urdu", year: "2023", downloads: 190 },
    { id: 22, title: "Grade 9 Telugu Vyakaranamu", curriculum: "SSC", grade: "9", subject: "Telugu", year: "2023", downloads: 410 },
];

export function PreviousPapersTab() {
    const [filters, setFilters] = useState({
        curriculum: "All",
        grade: "All",
        subject: "All",
        search: ""
    });
    const [selectedPaper, setSelectedPaper] = useState<any>(null);

    const filteredPapers = MOCK_PAPERS.filter(paper => {
        const matchesCurriculum = filters.curriculum === "All" || paper.curriculum === filters.curriculum;
        const matchesGrade = filters.grade === "All" || paper.grade === filters.grade;
        const matchesSubject = filters.subject === "All" || paper.subject === filters.subject;
        const matchesSearch = paper.title.toLowerCase().includes(filters.search.toLowerCase());
        return matchesCurriculum && matchesGrade && matchesSubject && matchesSearch;
    });

    const subjects = Array.from(new Set(MOCK_PAPERS.map(p => p.subject)));
    const grades = Array.from(new Set(MOCK_PAPERS.map(p => p.grade))).sort((a, b) => Number(a) - Number(b));

    return (
        <div className="space-y-8 p-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 font-display">Previous Year Papers</h2>
                    <p className="text-slate-500 font-medium mt-1">Access and download past question papers for all boards</p>
                </div>
                <Button className="font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                    <Filter className="w-4 h-4 mr-2" /> Request Custom Paper
                </Button>
            </div>

            {/* Filters Section */}
            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search papers..."
                                className="pl-9 bg-slate-50 border-slate-200"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>

                        <Select value={filters.curriculum} onValueChange={(v) => setFilters(prev => ({ ...prev, curriculum: v }))}>
                            <SelectTrigger className="bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Curriculum" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Boards</SelectItem>
                                <SelectItem value="CBSE">CBSE</SelectItem>
                                <SelectItem value="ICSE">ICSE</SelectItem>
                                <SelectItem value="SSC">SSC</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.grade} onValueChange={(v) => setFilters(prev => ({ ...prev, grade: v }))}>
                            <SelectTrigger className="bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Class/Grade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Grades</SelectItem>
                                {grades.map(g => (
                                    <SelectItem key={g} value={g}>Class {g}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.subject} onValueChange={(v) => setFilters(prev => ({ ...prev, subject: v }))}>
                            <SelectTrigger className="bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Subjects</SelectItem>
                                {subjects.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Official Board Links Section */}
                    {filters.curriculum !== "All" && (
                        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-4 bg-indigo-50/30 p-6 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <BookOpen className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Curated {filters.curriculum} Resources</h4>
                                    <p className="text-xs text-slate-500 font-medium">Quick links to official papers and top educational archives</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {(() => {
                                    const resourceLinks: Record<string, { label: string, url: string }[]> = {
                                        "CBSE": [
                                            { label: "Official Question Papers", url: "https://www.cbse.gov.in/cbsenew/question-paper.html" },
                                            { label: "Academic Sample Papers", url: "https://cbseacademic.nic.in/sqp_classx_2023-24.html" },
                                            { label: "Byju's CBSE Archive", url: "https://byjus.com/cbse-previous-year-question-papers/" },
                                            { label: "SelfStudys CBSE Papers", url: "https://www.selfstudys.com/books/cbse-previous-year-paper" }
                                        ],
                                        "ICSE": [
                                            { label: "CISCE Official Portal", url: "https://cisce.org/examinations/" },
                                            { label: "Exam18 Prep Material", url: "https://www.exam18.com/" },
                                            { label: "AplusTopper Archive", url: "https://www.aplustopper.com/icse-previous-year-question-papers/" },
                                            { label: "Shaalaa ICSE Papers", url: "https://www.shaalaa.com/question-papers-university/icsc-class-10-10th-standard_2423" }
                                        ],
                                        "SSC": [
                                            { label: "Shaalaa SSC Archive", url: "https://www.shaalaa.com/question-papers-university/maharashtra-state-board-ssc-10th-standard_747" },
                                            { label: "Schools9 SSC Papers", url: "http://www.schools9.com/" },
                                            { label: "TS SSC Official (Telangana)", url: "https://www.bse.telangana.gov.in/" },
                                            { label: "AP SSC Official (Andhra)", url: "https://www.bse.ap.gov.in/" }
                                        ]
                                    };

                                    return resourceLinks[filters.curriculum]?.map((link, idx) => (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-xs justify-start h-10 px-4 rounded-xl shadow-sm transition-all"
                                            onClick={() => window.open(link.url, "_blank")}
                                        >
                                            <Eye className="w-3 h-3 mr-2 opacity-50" /> {link.label}
                                        </Button>
                                    ));
                                })()}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Papers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPapers.length > 0 ? (
                    filteredPapers.map(paper => (
                        <Card
                            key={paper.id}
                            onClick={() => setSelectedPaper(paper)}
                            className="group hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-pointer border-slate-200"
                        >
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">
                                        {paper.year}
                                    </Badge>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{paper.title}</h3>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 font-medium">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{paper.curriculum}</span>
                                        <span>•</span>
                                        <span>Class {paper.grade}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const query = `${paper.curriculum} Class ${paper.grade} ${paper.subject} Question Paper ${paper.year} pdf download`;
                                                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                                            }}
                                        >
                                            <Search className="w-3 h-3 mr-1" /> PDF Search
                                        </Button>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-indigo-50 hover:text-indigo-600">
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="font-medium text-lg">No papers found matching your filters</p>
                        <p className="text-sm">Try adjusting the filters or search terms</p>
                        <Button
                            variant="link"
                            className="mt-4 text-indigo-600 font-bold"
                            onClick={() => setFilters({ curriculum: "All", grade: "All", subject: "All", search: "" })}
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Paper Preview Dialog */}
            <Dialog open={!!selectedPaper} onOpenChange={(open) => !open && setSelectedPaper(null)}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2 border-b bg-slate-50/50">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            {selectedPaper?.title}
                        </DialogTitle>
                        <DialogDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="bg-white">{selectedPaper?.curriculum}</Badge>
                            <span className="text-xs">•</span>
                            <span>Class {selectedPaper?.grade}</span>
                            <span className="text-xs">•</span>
                            <span>{selectedPaper?.subject}</span>
                            <span className="text-xs">•</span>
                            <span>{selectedPaper?.year}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 bg-slate-50 relative overflow-hidden flex flex-col">
                        <ScrollArea className="flex-1 p-6">
                            {selectedPaper?.questions ? (
                                <div className="space-y-6 max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-100 min-h-full">
                                    <div className="text-center border-b pb-6 mb-6">
                                        <h2 className="text-2xl font-bold text-slate-900">{selectedPaper.title}</h2>
                                        <p className="text-slate-500 mt-2">Maximum Marks: 80 | Time: 3 Hours</p>
                                    </div>

                                    <div className="space-y-8">
                                        {selectedPaper.questions.map((q: any, i: number) => (
                                            <div key={i} className="flex gap-4">
                                                <span className="font-bold text-slate-500 w-6 flex-shrink-0">Q{i + 1}.</span>
                                                <div className="flex-1">
                                                    <p className="text-slate-800 font-medium text-lg leading-relaxed">{q.text}</p>
                                                    <div className="mt-2 flex justify-end">
                                                        <Badge variant="outline" className="text-slate-400">
                                                            {q.marks} Marks
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                        <FileText className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{selectedPaper?.title}</h3>
                                    <p className="text-slate-500 text-sm mb-4 max-w-sm">
                                        This is a placeholder preview. In the full version, the PDF or questions would be rendered here.
                                    </p>
                                    <Button variant="outline" size="sm">
                                        <Download className="w-4 h-4 mr-2" /> Download Full Paper
                                    </Button>
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    <DialogFooter className="p-6 border-t bg-white flex justify-between items-center sm:justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold"
                                onClick={() => {
                                    const query = `${selectedPaper?.curriculum} Class ${selectedPaper?.grade} ${selectedPaper?.subject} Previous Year Question Paper ${selectedPaper?.year} official pdf`;
                                    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                                }}
                            >
                                <Search className="w-4 h-4 mr-2" /> Find Full PDF
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setSelectedPaper(null)}>Close</Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                                <Download className="w-4 h-4 mr-2" /> Download PDF
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
