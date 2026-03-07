import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MoreVertical, Loader2, TrendingUp, TrendingDown, Mail, Plus, Pencil, Trash2, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function StudentsTab() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", email: "", grade: "", section: "", rollNo: "" });
    const [emailData, setEmailData] = useState({ subject: "", body: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const queryClient = useQueryClient();

    const { data: students, isLoading } = useQuery({
        queryKey: ['students-roster'],
        queryFn: async () => {
            const res = await api.get('/students/roster');
            return res.data;
        }
    });

    const addStudentMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/students', data);
            return res.data;
        },
        onSuccess: () => {
            setIsAddOpen(false);
            setFormData({ name: "", email: "", grade: "", section: "", rollNo: "" });
            queryClient.invalidateQueries({ queryKey: ['students-roster'] });
            toast.success("Student added successfully!");
        }
    });

    const updateStudentMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.put(`/students/${currentStudent.id}`, data);
            return res.data;
        },
        onSuccess: () => {
            setIsEditOpen(false);
            setCurrentStudent(null);
            setFormData({ name: "", email: "", grade: "", section: "", rollNo: "" });
            queryClient.invalidateQueries({ queryKey: ['students-roster'] });
            toast.success("Student updated successfully!");
        }
    });

    const deleteStudentMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/students/${id}`);
        },
        onSuccess: () => {
            setIsDeleteOpen(false);
            setCurrentStudent(null);
            queryClient.invalidateQueries({ queryKey: ['students-roster'] });
            toast.success("Student removed successfully.");
        }
    });

    const emailMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/messages/email', data);
            return res.data;
        },
        onSuccess: () => {
            setIsEmailOpen(false);
            setCurrentStudent(null);
            setEmailData({ subject: "", body: "" });
            toast.success("Email sent to parent successfully!");
        }
    });

    const openEdit = (student: any) => {
        setCurrentStudent(student);
        setFormData({
            name: student.name,
            email: student.email,
            grade: student.grade.toString(),
            section: student.section,
            rollNo: student.rollNo ? student.rollNo.toString() : ""
        });
        setIsEditOpen(true);
    };

    const openDelete = (student: any) => {
        setCurrentStudent(student);
        setIsDeleteOpen(true);
    };

    const openEmail = (student: any) => {
        setCurrentStudent(student);
        setEmailData({ subject: "", body: "" });
        setIsEmailOpen(true);
    };

    const filteredStudents = students ? students.filter((s: any) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#6b5ea7]" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#3d3151] font-display">Student Roster</h2>
                    <p className="text-slate-500 font-medium">Manage your students and track their performance</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64 bg-white border-slate-200 h-11 rounded-xl focus-visible:ring-[#6b5ea7]"
                        />
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 bg-[#6b5ea7] hover:bg-[#3d3151] text-white font-bold rounded-xl px-6 shadow-lg shadow-purple-50 transition-all">
                                <Plus className="w-5 h-5 mr-2" />
                                Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl border-none">
                            <DialogHeader>
                                <DialogTitle className="text-[#3d3151] font-display font-bold">Add New Student</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</Label>
                                    <Input className="rounded-xl border-slate-200 focus-visible:ring-[#6b5ea7]" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Rahul Sharma" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</Label>
                                    <Input className="rounded-xl border-slate-200 focus-visible:ring-[#6b5ea7]" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="student@school.com" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Grade</Label>
                                        <Input className="rounded-xl border-slate-200 focus-visible:ring-[#6b5ea7]" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} placeholder="10" type="number" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Section</Label>
                                        <Input className="rounded-xl border-slate-200 focus-visible:ring-[#6b5ea7]" value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} placeholder="A" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Roll No</Label>
                                        <Input className="rounded-xl border-slate-200 focus-visible:ring-[#6b5ea7]" value={formData.rollNo} onChange={e => setFormData({ ...formData, rollNo: e.target.value })} placeholder="101" type="number" />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" className="rounded-xl" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={() => addStudentMutation.mutate(formData)}
                                    disabled={!formData.name || !formData.grade || addStudentMutation.isPending}
                                    className="bg-[#6b5ea7] hover:bg-[#3d3151] font-bold rounded-xl"
                                >
                                    {addStudentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Create Student
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Student Dialog */}
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="rounded-3xl border-none">
                            <DialogHeader>
                                <DialogTitle className="text-[#3d3151] font-display font-bold">Edit Student Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</Label>
                                    <Input className="rounded-xl border-slate-200 focus-visible:ring-[#6b5ea7]" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</Label>
                                    <Input className="rounded-xl border-slate-200 focus-visible:ring-[#6b5ea7]" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Grade</Label>
                                        <Input className="rounded-xl border-slate-200 focus-visible:ring-[#6b5ea7]" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} type="number" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Section</Label>
                                        <Input className="rounded-xl border-slate-200 focus-visible:ring-[#6b5ea7]" value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Roll No</Label>
                                        <Input className="rounded-xl border-slate-200 focus-visible:ring-[#6b5ea7]" value={formData.rollNo} onChange={e => setFormData({ ...formData, rollNo: e.target.value })} type="number" />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" className="rounded-xl" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={() => updateStudentMutation.mutate(formData)}
                                    disabled={!formData.name || updateStudentMutation.isPending}
                                    className="bg-[#6b5ea7] hover:bg-[#3d3151] text-white font-bold rounded-xl"
                                >
                                    {updateStudentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Update Student
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                        <DialogContent className="rounded-3xl border-none">
                            <DialogHeader>
                                <DialogTitle className="text-[#3d3151] font-display font-bold">Remove Student?</DialogTitle>
                                <DialogDescription className="font-medium">
                                    Are you sure you want to remove <strong>{currentStudent?.name}</strong> from the roster? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="ghost" className="rounded-xl" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={() => deleteStudentMutation.mutate(currentStudent.id)}
                                    disabled={deleteStudentMutation.isPending}
                                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl"
                                >
                                    {deleteStudentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Remove Student
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Send Email Dialog */}
                    <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
                        <DialogContent className="rounded-3xl border-none">
                            <DialogHeader>
                                <DialogTitle className="text-[#3d3151] font-display font-bold">Send Email to {currentStudent?.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">To</Label>
                                    <Input value={currentStudent?.email || "No email registered"} disabled className="bg-slate-50 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Subject</Label>
                                    <Input
                                        className="rounded-xl border-slate-200 focus-visible:ring-[#6b5ea7]"
                                        value={emailData.subject}
                                        onChange={e => setEmailData({ ...emailData, subject: e.target.value })}
                                        placeholder="Regarding attendance/progress..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Message</Label>
                                    <Textarea
                                        value={emailData.body}
                                        onChange={e => setEmailData({ ...emailData, body: e.target.value })}
                                        placeholder="Type your message here..."
                                        className="h-32 resize-none rounded-xl border-slate-200 focus-visible:ring-[#6b5ea7]"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" className="rounded-xl" onClick={() => setIsEmailOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={() => emailMutation.mutate({ parentId: currentStudent?.id, ...emailData })}
                                    disabled={!emailData.subject || !emailData.body || emailMutation.isPending}
                                    className="bg-[#6b5ea7] hover:bg-[#3d3151] text-white font-bold rounded-xl"
                                >
                                    {emailMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    Send Email
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden min-h-[500px] rounded-[2rem]">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#6b5ea7]" />
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-[#f5f3f7] border-b border-[#6b5ea7]/10">
                                <tr>
                                    <th className="px-6 py-5 font-black text-[#3d3151] text-xs uppercase tracking-widest">Student</th>
                                    <th className="px-6 py-5 font-black text-[#3d3151] text-xs uppercase tracking-widest">Class</th>
                                    <th className="px-6 py-5 font-black text-[#3d3151] text-xs uppercase tracking-widest">Avg. Performance</th>
                                    <th className="px-6 py-5 font-black text-[#3d3151] text-xs uppercase tracking-widest">Attendance</th>
                                    <th className="px-6 py-5 font-black text-[#3d3151] text-xs uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.map((student: any) => (
                                    <tr key={student.id} className="hover:bg-[#f5f3f7]/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 border-2 border-[#6b5ea7]/20 shadow-sm">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                                                    <AvatarFallback>{student.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold text-[#3d3151]">{student.name}</div>
                                                    <div className="text-xs text-slate-400 font-medium">{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-600">Grade {student.grade}-{student.section}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-black text-[#6b5ea7]">
                                                {student.avgPerformance}%
                                                {student.avgPerformance >= 50 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black capitalize tracking-widest
                                                ${student.lastAttendance === 'PRESENT' ? 'bg-[#f5f3f7] text-[#6b5ea7]' :
                                                    student.lastAttendance === 'ABSENT' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                                                {student.lastAttendance}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => openEmail(student)} className="h-9 w-9 p-0 text-slate-400 hover:text-[#6b5ea7] hover:bg-[#f5f3f7] rounded-xl transition-all">
                                                    <Mail className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => openEdit(student)} className="h-9 w-9 p-0 text-slate-400 hover:text-[#6b5ea7] hover:bg-[#f5f3f7] rounded-xl transition-all">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => openDelete(student)} className="h-9 w-9 p-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        </div>
    );
}
