import { Fragment, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, MapPin, Users, ChevronLeft, ChevronRight, MoreHorizontal, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday as isTodayFns
} from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar as LucideCalendar } from "lucide-react";

export function CalendarTab() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewAllOpen, setIsViewAllOpen] = useState(false);

    const holidays = [
        { date: new Date(2026, 0, 1), title: "New Year's Day", type: "holiday", color: "bg-red-100 text-red-700" },
        { date: new Date(2026, 0, 26), title: "Republic Day", type: "holiday", color: "bg-orange-100 text-orange-700" },
        { date: new Date(2026, 1, 14), title: "Valentine's Day", type: "event", color: "bg-pink-100 text-pink-700" },
        { date: new Date(2026, 2, 8), title: "Holi Festival", type: "festival", color: "bg-yellow-100 text-yellow-700" },
        { date: new Date(2026, 2, 21), title: "Eid al-Fitr", type: "festival", color: "bg-emerald-100 text-emerald-700" },
        { date: new Date(2026, 7, 15), title: "Independence Day", type: "holiday", color: "bg-orange-100 text-orange-700" },
        { date: new Date(2026, 9, 2), title: "Gandhi Jayanti", type: "holiday", color: "bg-red-100 text-red-700" },
        { date: new Date(2026, 10, 8), title: "Diwali", type: "festival", color: "bg-amber-100 text-amber-700" },
        { date: new Date(2026, 11, 25), title: "Christmas Day", type: "holiday", color: "bg-red-100 text-red-700" },
    ];
    const [events, setEvents] = useState([
        {
            id: 1,
            title: "Mathematics Class - 8A",
            time: "09:00 AM - 10:30 AM",
            type: "class",
            color: "bg-blue-100 text-blue-700",
            location: "Room 302",
            attendees: 32,
            date: new Date()
        },
        {
            id: 2,
            title: "Science Quiz Preparation",
            time: "11:30 AM - 12:45 PM",
            type: "class",
            color: "bg-emerald-100 text-emerald-700",
            location: "Lab 2",
            attendees: 28,
            date: new Date()
        }
    ]);

    const timeSlots = [
        "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
        "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
        "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
        "05:00 PM", "05:30 PM", "06:00 PM"
    ];

    const classesList = [
        { id: "8A", name: "Class 8A", students: 32 },
        { id: "7B", name: "Class 7B", students: 28 },
        { id: "9A", name: "Class 9A", students: 35 },
        { id: "10C", name: "Class 10C", students: 30 },
    ];

    const [newEvent, setNewEvent] = useState({
        title: "",
        date: new Date(),
        startTime: "09:00 AM",
        endTime: "10:30 AM",
        type: "class",
        location: "",
        attendees: "32",
        classId: "8A"
    });

    const handleAddEvent = () => {
        if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
            toast.error("Please fill in title and time range");
            return;
        }

        const event = {
            id: events.length + 1,
            title: newEvent.title,
            time: `${newEvent.startTime} - ${newEvent.endTime}`,
            type: newEvent.type,
            location: newEvent.location,
            attendees: parseInt(newEvent.attendees) || 0,
            date: newEvent.date,
            color: newEvent.type === "class"
                ? "bg-blue-100 text-blue-700"
                : newEvent.type === "meeting"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-orange-100 text-orange-700"
        };

        setEvents([event, ...events]);
        setIsDialogOpen(false);
        // If event is in a different month/year, we might want to navigate there, 
        // but for now we just show a toast
        if (!isSameMonth(newEvent.date, currentMonth)) {
            setCurrentMonth(newEvent.date);
        }
        setDate(newEvent.date);
        setNewEvent({
            title: "",
            date: new Date(),
            startTime: "09:00 AM",
            endTime: "10:30 AM",
            type: "class",
            location: "",
            attendees: "32",
            classId: "8A"
        });
        toast.success("Event added successfully");
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight">Calendar</h1>
                    <p className="text-slate-500 font-bold mt-1">Manage your schedule and events</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#4F46E5] hover:bg-[#4338ca] text-white font-bold gap-2 rounded-xl">
                            <Plus className="w-4 h-4" /> Add Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-slate-900 font-display">Create New Event</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="font-bold text-slate-700">Event Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Mathematics Class"
                                    className="rounded-xl border-slate-200 focus:ring-slate-400"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal rounded-xl border-slate-200",
                                                    !newEvent.date && "text-muted-foreground"
                                                )}
                                            >
                                                <LucideCalendar className="mr-2 h-4 w-4" />
                                                {newEvent.date ? format(newEvent.date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={newEvent.date}
                                                onSelect={(date) => date && setNewEvent({ ...newEvent, date })}
                                                initialFocus
                                                className="rounded-2xl"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type" className="font-bold text-slate-700">Event Type</Label>
                                    <Select
                                        value={newEvent.type}
                                        onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                                    >
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="class">Class</SelectItem>
                                            <SelectItem value="meeting">Meeting</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">Start Time</Label>
                                    <Select
                                        value={newEvent.startTime}
                                        onValueChange={(value) => setNewEvent({ ...newEvent, startTime: value })}
                                    >
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {timeSlots.map(time => (
                                                <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">End Time</Label>
                                    <Select
                                        value={newEvent.endTime}
                                        onValueChange={(value) => setNewEvent({ ...newEvent, endTime: value })}
                                    >
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {timeSlots.map(time => (
                                                <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {newEvent.type === "class" && (
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">Select Class</Label>
                                    <Select
                                        value={newEvent.classId}
                                        onValueChange={(value) => {
                                            const selectedClass = classesList.find(c => c.id === value);
                                            setNewEvent({
                                                ...newEvent,
                                                classId: value,
                                                attendees: selectedClass?.students.toString() || "0",
                                                title: selectedClass ? `${selectedClass.name} - Lesson` : newEvent.title
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder="Select a class" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {classesList.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="font-bold text-slate-700">Location</Label>
                                    <Input
                                        id="location"
                                        placeholder="Room 302"
                                        className="rounded-xl border-slate-200"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="attendees" className="font-bold text-slate-700">Students Count</Label>
                                    <Input
                                        id="attendees"
                                        type="number"
                                        placeholder="32"
                                        className="rounded-xl border-slate-200"
                                        value={newEvent.attendees}
                                        onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" className="font-bold text-slate-500" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button
                                className="bg-[#4F46E5] hover:bg-[#4338ca] text-white font-bold rounded-xl px-8"
                                onClick={handleAddEvent}
                            >
                                Create Event
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Calendar Area */}
                <div className="lg:col-span-8">
                    <Card className="border-none shadow-sm h-full">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-bold text-slate-900">{format(currentMonth, "MMMM yyyy")}</h2>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-full border-slate-200"
                                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-full border-slate-200"
                                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                                    <Button
                                        variant={viewMode === "day" ? "secondary" : "ghost"}
                                        size="sm"
                                        className={cn("h-8 px-3 rounded-md font-bold", viewMode === "day" ? "bg-white shadow-sm" : "text-slate-600")}
                                        onClick={() => setViewMode("day")}
                                    >
                                        Day
                                    </Button>
                                    <Button
                                        variant={viewMode === "week" ? "secondary" : "ghost"}
                                        size="sm"
                                        className={cn("h-8 px-3 rounded-md font-bold", viewMode === "week" ? "bg-white shadow-sm" : "text-slate-600")}
                                        onClick={() => setViewMode("week")}
                                    >
                                        Week
                                    </Button>
                                    <Button
                                        variant={viewMode === "month" ? "secondary" : "ghost"}
                                        size="sm"
                                        className={cn("h-8 px-3 rounded-md font-bold", viewMode === "month" ? "bg-white shadow-sm" : "text-slate-600")}
                                        onClick={() => setViewMode("month")}
                                    >
                                        Month
                                    </Button>
                                </div>
                            </div>

                            {/* Custom Month Grid Placeholder (since shadcn Calendar is small, we simulate a big one for dashboard feel or wrap shadcn one) */}
                            {/* Actually creating a full grid manually is safer for "wow" factor than default small calendar */}
                            <div className="min-h-[600px]">
                                {viewMode === "month" && (
                                    <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                                            <div key={day} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                {day}
                                            </div>
                                        ))}
                                        {(() => {
                                            const monthStart = startOfMonth(currentMonth);
                                            const monthEnd = endOfMonth(monthStart);
                                            const startDate = startOfWeek(monthStart);
                                            const endDate = endOfWeek(monthEnd);
                                            const days = eachDayOfInterval({ start: startDate, end: endDate });

                                            return days.map((day, i) => {
                                                const dayEvents = events.filter(e => isSameDay(e.date, day));
                                                const dayHolidays = holidays.filter(h => isSameDay(h.date, day));
                                                const isMainMonth = isSameMonth(day, monthStart);
                                                const isToday = isTodayFns(day);

                                                return (
                                                    <div
                                                        key={day.toString()}
                                                        onClick={() => {
                                                            setDate(day);
                                                            setNewEvent(prev => ({ ...prev, date: day }));
                                                            setIsDialogOpen(true);
                                                        }}
                                                        className={cn(
                                                            "bg-white min-h-[100px] p-2 hover:bg-slate-50 transition-colors group relative border-none outline-none cursor-pointer",
                                                            !isMainMonth && "bg-slate-50/50",
                                                            date && isSameDay(day, date) && "ring-2 ring-inset ring-indigo-500 z-10"
                                                        )}
                                                    >
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="bg-indigo-50 p-1 rounded-md text-indigo-600">
                                                                <Plus className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                        <span className={cn(
                                                            "text-sm font-bold mb-2 block",
                                                            isToday ? "bg-[#4F46E5] text-white w-7 h-7 flex items-center justify-center rounded-full" :
                                                                isMainMonth ? "text-slate-700" : "text-slate-300"
                                                        )}>
                                                            {format(day, "d")}
                                                        </span>
                                                        <div className="space-y-1">
                                                            {dayHolidays.map((holiday, idx) => (
                                                                <div
                                                                    key={`hol-${idx}`}
                                                                    className={cn(
                                                                        "p-1 rounded-md text-[9px] font-black truncate border border-opacity-20",
                                                                        holiday.color
                                                                    )}
                                                                >
                                                                    🚩 {holiday.title}
                                                                </div>
                                                            ))}
                                                            {dayEvents.map((event) => (
                                                                <div
                                                                    key={event.id}
                                                                    className={cn(
                                                                        "p-1.5 rounded-md text-[10px] font-bold truncate border border-opacity-20",
                                                                        event.color
                                                                    )}
                                                                    title={`${event.title} (${event.time})`}
                                                                >
                                                                    {event.title.split('-')[0].trim()}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                )}

                                {viewMode === "week" && (
                                    <div className="grid grid-cols-8 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200 shadow-sm h-full font-display">
                                        <div className="bg-slate-50 p-2 border-r border-slate-200"></div>
                                        {eachDayOfInterval({
                                            start: startOfWeek(currentMonth),
                                            end: endOfWeek(currentMonth)
                                        }).map(day => (
                                            <div key={day.toString()} className={cn(
                                                "bg-slate-50 p-3 text-center border-b border-slate-200",
                                                isTodayFns(day) && "bg-indigo-50"
                                            )}>
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{format(day, "EEE")}</div>
                                                <div className={cn(
                                                    "text-lg font-black mt-1",
                                                    isTodayFns(day) ? "text-indigo-600" : "text-slate-800"
                                                )}>{format(day, "d")}</div>
                                            </div>
                                        ))}

                                        {/* Simplified Hour Grid for Week View */}
                                        {["08 AM", "10 AM", "12 PM", "02 PM", "04 PM", "06 PM"].map(hour => (
                                            <Fragment key={hour}>
                                                <div key={hour} className="bg-slate-50 p-4 text-[10px] font-black text-slate-400 text-right border-r border-slate-200">
                                                    {hour}
                                                </div>
                                                {Array.from({ length: 7 }).map((_, i) => {
                                                    const currentDay = eachDayOfInterval({
                                                        start: startOfWeek(currentMonth),
                                                        end: endOfWeek(currentMonth)
                                                    })[i];
                                                    const hourlyEvents = events.filter(e => isSameDay(e.date, currentDay) && e.time.includes(hour.split(' ')[0]));

                                                    return (
                                                        <div
                                                            key={i}
                                                            onClick={() => {
                                                                const startTime = hour.replace(' ', ':00 ');
                                                                setNewEvent(prev => ({
                                                                    ...prev,
                                                                    date: currentDay,
                                                                    startTime: startTime,
                                                                    endTime: hour.includes('PM') && !hour.includes('12') || hour.includes('12 AM') ? startTime : format(addMonths(new Date().setHours(parseInt(hour), 0), 0), "hh:mm a") // Simple logic for end time
                                                                }));
                                                                // Actually let's just prefill the start time accurately
                                                                const hourVal = parseInt(hour);
                                                                const isPM = hour.includes('PM');
                                                                const formattedStart = `${hourVal.toString().padStart(2, '0')}:00 ${isPM ? 'PM' : 'AM'}`;

                                                                setNewEvent(prev => ({
                                                                    ...prev,
                                                                    date: currentDay,
                                                                    startTime: formattedStart,
                                                                    endTime: `${(hourVal + 1).toString().padStart(2, '0')}:00 ${isPM ? 'PM' : 'AM'}`
                                                                }));
                                                                setIsDialogOpen(true);
                                                            }}
                                                            className="bg-white min-h-[80px] p-2 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group relative"
                                                        >
                                                            <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/30 transition-colors flex items-center justify-center">
                                                                <Plus className="w-5 h-5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100" />
                                                            </div>
                                                            <div className="relative z-10 space-y-1">
                                                                {hourlyEvents.map(event => (
                                                                    <div key={event.id} className={cn("p-2 rounded-xl text-[10px] font-bold mb-1 border-l-4 shadow-sm", event.color)}>
                                                                        {event.title}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </Fragment>
                                        ))}
                                    </div>
                                )}

                                {viewMode === "day" && (
                                    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-full">
                                        <div className="flex items-center gap-6 p-8 border-b border-slate-100 bg-slate-50/50">
                                            <div className="text-6xl font-black text-indigo-600 font-display">{format(currentMonth, "dd")}</div>
                                            <div>
                                                <div className="text-2xl font-black text-slate-900 font-display">{format(currentMonth, "EEEE")}</div>
                                                <div className="text-slate-500 font-bold">{format(currentMonth, "MMMM yyyy")}</div>
                                            </div>
                                        </div>
                                        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                                            {(() => {
                                                const dayEvents = events.filter(e => isSameDay(e.date, currentMonth));
                                                const dayHolidays = holidays.filter(h => isSameDay(h.date, currentMonth));

                                                if (dayEvents.length === 0 && dayHolidays.length === 0) {
                                                    return (
                                                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                                            <CalendarIcon className="w-16 h-16 mb-4 opacity-20" />
                                                            <p className="text-xl font-bold">No events scheduled for today</p>
                                                            <Button variant="link" className="text-indigo-600 font-bold mt-2" onClick={() => setIsDialogOpen(true)}>+ Add something to your schedule</Button>
                                                        </div>
                                                    )
                                                }

                                                return (
                                                    <>
                                                        {dayHolidays.map((holiday, idx) => (
                                                            <div key={idx} className={cn("p-6 rounded-3xl border-2 flex items-center justify-between shadow-sm", holiday.color.replace('bg-', 'bg-').replace('text-', 'text-'))}>
                                                                <div className="flex items-center gap-6">
                                                                    <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-2xl">🚩</div>
                                                                    <div>
                                                                        <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">{holiday.type}</div>
                                                                        <div className="text-2xl font-black">{holiday.title}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {dayEvents.map((event) => (
                                                            <div key={event.id} className={cn("p-6 rounded-3xl border-l-[12px] flex items-center justify-between shadow-sm hover:scale-[1.01] transition-transform", event.color, "border-opacity-30")}>
                                                                <div className="flex items-center gap-6">
                                                                    <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center shadow-inner">
                                                                        <Clock className="w-7 h-7 text-slate-700" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-lg font-black text-slate-900">{event.title}</div>
                                                                        <div className="flex items-center gap-4 mt-1">
                                                                            <span className="text-sm font-bold opacity-70 flex items-center gap-1"><Clock className="w-4 h-4" /> {event.time}</span>
                                                                            <span className="text-sm font-bold opacity-70 flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Badge className="bg-white/50 text-slate-900 font-black px-4 py-2 rounded-xl border-none">{event.attendees} Students</Badge>
                                                            </div>
                                                        ))}
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Side Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-xl border-none mx-auto"
                            />
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 font-display">
                                Events for {date ? format(date, "MMM d, yyyy") : "Selected Date"}
                            </h3>
                            {events.length > 0 && (
                                <Dialog open={isViewAllOpen} onOpenChange={setIsViewAllOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 font-bold bg-indigo-50 hover:bg-indigo-100 rounded-lg">
                                            View All
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col rounded-2xl border-none shadow-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black text-slate-900 font-display">All Scheduled Events</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 mt-4 custom-scrollbar">
                                            {events.map((event) => (
                                                <div
                                                    key={event.id}
                                                    className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${event.color}`}>
                                                            {event.type}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-400">ID: #{event.id}</span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 mb-2">{event.title}</h4>
                                                    <div className="grid grid-cols-2 gap-y-2">
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                            <Clock className="w-3.5 h-3.5 text-indigo-500" /> {event.time}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> {event.location}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                            <Users className="w-3.5 h-3.5 text-emerald-500" /> {event.attendees} Attendees
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <DialogFooter className="mt-4">
                                            <Button className="w-full bg-[#4F46E5] text-white font-bold rounded-xl" onClick={() => setIsViewAllOpen(false)}>
                                                Close
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        {events.filter(e => date && isSameDay(e.date, date)).length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-400 font-bold text-sm">No events for this date</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {events
                                    .filter(e => date && isSameDay(e.date, date))
                                    .slice(0, 4)
                                    .map((event, idx) => (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${event.color}`}>
                                                    {event.type}
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-600">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <h4 className="font-bold text-slate-900 mb-1">{event.title}</h4>
                                            <div className="space-y-1.5 mt-3">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                    <Clock className="w-3.5 h-3.5" /> {event.time}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                    <MapPin className="w-3.5 h-3.5" /> {event.location}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                    <Users className="w-3.5 h-3.5" /> {event.attendees} Attendees
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
