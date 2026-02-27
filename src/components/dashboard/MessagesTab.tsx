import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Search, MoreVertical, CheckCircle2, Loader2, History, MessageSquare, Mail } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function MessagesTab() {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [msgContent, setMsgContent] = useState("");
    const [emailOpen, setEmailOpen] = useState(false);
    const [customEmail, setCustomEmail] = useState("");
    const [emailData, setEmailData] = useState({ subject: "", body: "" });
    const [activeView, setActiveView] = useState<'chats' | 'history'>('chats');
    const queryClient = useQueryClient();

    const { data: messages, isLoading } = useQuery({
        queryKey: ['messages'],
        queryFn: async () => {
            const res = await api.get('/messages');
            return res.data;
        }
    });

    const sendMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/messages', data);
            return res.data;
        },
        onSuccess: () => {
            setMsgContent("");
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });

    const emailMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/messages/email', data);
            return res.data;
        },
        onSuccess: () => {
            setEmailOpen(false);
            setEmailData({ subject: "", body: "" });
            toast.success("Email sent successfully!");
            queryClient.invalidateQueries({ queryKey: ['email-history'] });
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.error || "Failed to send email. Please check your SMTP settings.";
            toast.error("Email Failed", {
                description: errorMsg
            });
        }
    });

    const { data: emailHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['email-history'],
        queryFn: async () => {
            const res = await api.get('/messages/email-history');
            return res.data;
        }
    });

    // Group messages by contact
    const contacts = messages ? Array.from(new Set(messages.map((m: any) =>
        m.senderId === api.defaults.headers.common['Authorization'] ? m.receiverId : m.senderId
    ))).map(id => {
        const msg = messages.find((m: any) => m.senderId === id || m.receiverId === id);
        return msg.senderId === id ? msg.sender : msg.receiver;
    }) : [];

    const [recipientId, setRecipientId] = useState<string>("");

    // Fetch all students to populate the "To" dropdown
    const { data: allStudents } = useQuery({
        queryKey: ['students-roster-email'],
        queryFn: async () => {
            const res = await api.get('/students/roster');
            return res.data;
        }
    });

    // When opening dialog, set recipient if a user is already selected in chat
    const handleOpenEmail = (open: boolean) => {
        if (open && selectedUser) {
            setRecipientId(selectedUser.id);
        }
        setEmailOpen(open);
    };

    return (
        <div className="h-[calc(100vh-180px)] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex">
            {/* Sidebar Toggle */}
            <div className="w-16 border-r border-slate-100 flex flex-col items-center py-6 gap-6 bg-slate-50/50">
                <button
                    onClick={() => setActiveView('chats')}
                    className={`p-3 rounded-2xl transition-all ${activeView === 'chats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-white hover:text-indigo-600'}`}
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setActiveView('history')}
                    className={`p-3 rounded-2xl transition-all ${activeView === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-white hover:text-indigo-600'}`}
                >
                    <History className="w-6 h-6" />
                </button>
            </div>

            {/* Content Sidebar */}
            <div className="w-80 border-r border-slate-100 flex flex-col">
                <div className="p-6 border-b border-slate-50 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-slate-800">
                            {activeView === 'chats' ? 'Messages' : 'Email History'}
                        </h3>
                        {activeView === 'chats' && (
                            <Dialog open={emailOpen} onOpenChange={handleOpenEmail}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                        Compose Email
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Send Email to Parent/Student</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>To</Label>
                                            <Select
                                                value={recipientId}
                                                onValueChange={(val) => {
                                                    setRecipientId(val);
                                                    if (val !== 'custom') setCustomEmail("");
                                                }}
                                            >
                                                <SelectTrigger className="bg-slate-50">
                                                    <SelectValue placeholder="Select Recipient" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60">
                                                    <SelectItem value="custom" className="text-indigo-600 font-bold italic">
                                                        + Enter Custom Email...
                                                    </SelectItem>
                                                    {allStudents?.map((s: any) => (
                                                        <SelectItem key={s.id} value={s.id}>
                                                            {s.name} (Grade {s.grade}-{s.section})
                                                        </SelectItem>
                                                    ))}
                                                    {/* Also include current chat contacts if not in student list */}
                                                    {contacts.filter((c: any) => !allStudents?.find((s: any) => s.id === c.id)).map((c: any) => (
                                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {recipientId === 'custom' && (
                                            <div className="space-y-2 animate-in slide-in-from-top-2">
                                                <Label>Custom Email Address</Label>
                                                <Input
                                                    type="email"
                                                    placeholder="example@mail.com"
                                                    value={customEmail}
                                                    onChange={(e) => setCustomEmail(e.target.value)}
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label>Subject</Label>
                                            <Input
                                                placeholder="Regarding student progress..."
                                                value={emailData.subject}
                                                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Message Body</Label>
                                            <Textarea
                                                placeholder="Dear Parent..."
                                                className="h-32 resize-none"
                                                value={emailData.body}
                                                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => setEmailOpen(false)} variant="ghost">Cancel</Button>
                                        <Button
                                            onClick={() => emailMutation.mutate({
                                                parentId: recipientId === 'custom' ? null : recipientId,
                                                customEmail: recipientId === 'custom' ? customEmail : null,
                                                ...emailData
                                            })}
                                            disabled={
                                                (recipientId !== 'custom' && !recipientId) ||
                                                (recipientId === 'custom' && !customEmail) ||
                                                !emailData.subject || !emailData.body || emailMutation.isPending
                                            }
                                            className="bg-indigo-600 text-white font-bold"
                                        >
                                            {emailMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Send Email
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input className="pl-10 bg-slate-50 border-none rounded-xl" placeholder="Search chats..." />
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    {activeView === 'chats' ? (
                        contacts.map((contact: any) => (
                            <button
                                key={contact.id}
                                onClick={() => setSelectedUser(contact)}
                                className={`w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${selectedUser?.id === contact.id ? 'bg-indigo-50/50 border-r-4 border-indigo-500' : ''}`}
                            >
                                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`} />
                                    <AvatarFallback>{contact.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="text-left flex-1">
                                    <h4 className="font-bold text-slate-900 text-sm">{contact.name}</h4>
                                    <p className="text-xs text-slate-500 font-medium truncate">Click to chat...</p>
                                </div>
                            </button>
                        ))
                    ) : (
                        emailHistory?.map((log: any) => (
                            <div key={log.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{log.recipientName === 'External Recipient' ? 'CUSTOM' : 'USER'}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(log.sentAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm truncate">{log.subject}</h4>
                                <p className="text-xs text-slate-500 truncate mt-0.5">To: {log.recipientEmail}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col bg-slate-50/30">
                {activeView === 'chats' ? (
                    selectedUser ? (
                        <>
                            <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name}`} />
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{selectedUser.name}</h3>
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Online</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
                            </div>

                            <div className="flex-1 p-8 overflow-auto space-y-6">
                                {messages?.filter((m: any) => m.senderId === selectedUser.id || m.receiverId === selectedUser.id).map((m: any) => (
                                    <div key={m.id} className={`flex ${m.senderId === selectedUser.id ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[70%] p-4 rounded-2xl text-sm font-medium shadow-sm ${m.senderId === selectedUser.id ? 'bg-white text-slate-700 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                                            {m.content}
                                            <div className={`mt-1 text-[10px] opacity-60 flex items-center justify-end gap-1`}>
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {m.senderId !== selectedUser.id && <CheckCircle2 className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-white border-t border-slate-100">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); sendMutation.mutate({ receiverId: selectedUser.id, content: msgContent }); }}
                                    className="flex items-center gap-4"
                                >
                                    <input
                                        value={msgContent}
                                        onChange={(e) => setMsgContent(e.target.value)}
                                        className="flex-1 bg-slate-50 border-none rounded-2xl h-12 px-6 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Type a message..."
                                    />
                                    <Button type="submit" className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 p-0">
                                        <Send className="w-5 h-5 text-white" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                                <Send className="w-10 h-10 opacity-20" />
                            </div>
                            <p className="font-medium">Select a contact to start messaging</p>
                        </div>
                    )
                ) : (
                    <ScrollArea className="flex-1 p-8">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Communication History</h2>
                                    <p className="text-slate-500 font-medium">Log of all sent emails and notifications</p>
                                </div>
                            </div>

                            {emailHistory?.length > 0 ? (
                                <div className="grid gap-4">
                                    {emailHistory.map((log: any) => (
                                        <Card key={log.id} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-slate-900">{log.subject}</h4>
                                                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                                                {log.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-medium">To: {log.recipientName} ({log.recipientEmail})</p>
                                                    </div>
                                                    <span className="text-xs text-slate-400 font-bold">
                                                        {new Date(log.sentAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="bg-slate-50/50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed font-medium">
                                                    {log.body}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <Mail className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold">No emails recorded in history</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div>
    );
}
