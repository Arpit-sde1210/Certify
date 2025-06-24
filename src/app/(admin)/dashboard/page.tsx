"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  Copy,
  ExternalLink,
  Plus
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Workshop {
  id: string;
  collegeName: string;
  workshopName: string;
  status: "on" | "off";
  uniqueLink: string | null;
  createdAt: {
    toDate: () => Date;
  };
  submissions?: number;
  date?: Date;
}

// Dummy data for demonstration
const dummyWorkshops: Workshop[] = [
  {
    id: "1",
    collegeName: "MIT Institute of Technology",
    workshopName: "Advanced React Development",
    status: "on",
    uniqueLink: "react-adv-2024",
    createdAt: { toDate: () => new Date("2024-01-15") },
    submissions: 45,
    date: new Date("2024-02-20")
  },
  {
    id: "2",
    collegeName: "Stanford University",
    workshopName: "Machine Learning Fundamentals",
    status: "on",
    uniqueLink: "ml-fund-2024",
    createdAt: { toDate: () => new Date("2024-01-10") },
    submissions: 78,
    date: new Date("2024-02-25")
  },
  {
    id: "3",
    collegeName: "Harvard Business School",
    workshopName: "Digital Marketing Strategy",
    status: "off",
    uniqueLink: null,
    createdAt: { toDate: () => new Date("2024-01-05") },
    submissions: 32,
    date: new Date("2024-02-15")
  },
  {
    id: "4",
    collegeName: "UC Berkeley",
    workshopName: "Data Science Workshop",
    status: "on",
    uniqueLink: "ds-workshop-2024",
    createdAt: { toDate: () => new Date("2024-01-20") },
    submissions: 56,
    date: new Date("2024-03-01")
  }
];

export default function DashboardPage() {
  const displayWorkshops = dummyWorkshops;
  const totalWorkshops = displayWorkshops.length;
  const activeWorkshops = displayWorkshops.filter(w => w.status === "on").length;
  const totalSubmissions = displayWorkshops.reduce((sum, w) => sum + (w.submissions || 0), 0);
  const upcomingWorkshops = displayWorkshops.filter(w => w.date && w.date > new Date()).length;

  const [showConfetti, setShowConfetti] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="700" cy="100" r="120" fill="#6366F1" fillOpacity="0.08" />
          <circle cx="100" cy="500" r="180" fill="#3B82F6" fillOpacity="0.06" />
        </svg>
      </div>
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-5xl animate-bounce">🎉🎊</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full max-w-6xl space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s an overview of your workshop forms.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/forms/create">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Workshop
              </Button>
            </Link>
          </div>
        </div>
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))
            ) : (
              [
                <motion.div key="card1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg relative">
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-400/30 via-blue-400/20 to-purple-400/30 blur-sm z-0" />
                    <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Workshops</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="text-2xl font-bold">{totalWorkshops}</div>
                      <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                  </Card>
                </motion.div>,
                <motion.div key="card2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                  <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg relative">
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-400/30 via-blue-400/20 to-purple-400/30 blur-sm z-0" />
                    <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="text-2xl font-bold">{activeWorkshops}</div>
                      <p className="text-xs text-muted-foreground">Currently accepting submissions</p>
                    </CardContent>
                  </Card>
                </motion.div>,
                <motion.div key="card3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg relative">
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-400/30 via-blue-400/20 to-purple-400/30 blur-sm z-0" />
                    <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="text-2xl font-bold">{totalSubmissions}</div>
                      <p className="text-xs text-muted-foreground">+12% from last week</p>
                    </CardContent>
                  </Card>
                </motion.div>,
                <motion.div key="card4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }}>
                  <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg relative">
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-400/30 via-blue-400/20 to-purple-400/30 blur-sm z-0" />
                    <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Upcoming Workshops</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="text-2xl font-bold">{upcomingWorkshops}</div>
                      <p className="text-xs text-muted-foreground">Scheduled for next 30 days</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ]
            )}
          </AnimatePresence>
        </div>
        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}>
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-400/30 via-blue-400/20 to-purple-400/30 blur-sm z-0" />
            <CardHeader className="relative z-10">
              <CardTitle>Recent Workshops</CardTitle>
              <CardDescription>
                A list of your recently created workshop feedback forms.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {loading ? (
                <Skeleton className="h-40 w-full rounded-md" />
              ) : (
                <div className="rounded-md border bg-white/80">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Workshop Name</TableHead>
                        <TableHead>College</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {displayWorkshops.map((workshop) => (
                          <motion.tr
                            key={workshop.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold">{workshop.workshopName}</div>
                                <div className="text-sm text-muted-foreground">
                                  Created {formatDate(workshop.createdAt.toDate())}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{workshop.collegeName}</TableCell>
                            <TableCell>
                              {workshop.date ? formatDate(workshop.date) : "Not set"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {workshop.submissions || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={workshop.status === "on" ? "default" : "secondary"}
                                className="flex items-center gap-1"
                              >
                                {workshop.status === "on" ? (
                                  <>
                                    <CheckCircle className="h-3 w-3" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3" />
                                    Inactive
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {workshop.uniqueLink ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => copyToClipboard(`${window.location.origin}/form/${workshop.uniqueLink}`)}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Copy Link</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Link href={`/form/${workshop.uniqueLink}`} target="_blank">
                                          <Button variant="outline" size="sm">
                                            <ExternalLink className="h-3 w-3" />
                                          </Button>
                                        </Link>
                                      </TooltipTrigger>
                                      <TooltipContent>Open Form</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : null}
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 