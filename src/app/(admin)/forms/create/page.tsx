"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ArrowLeft, Save, Eye } from "lucide-react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
  } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

function generateRandomString(length: number) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export default function CreateFormPage() {
  const [collegeName, setCollegeName] = useState("")
  const [workshopName, setWorkshopName] = useState("")
  const [date, setDate] = useState<Date>()
  const [instructions, setInstructions] = useState("")
  const [formStatus, setFormStatus] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewLink, setPreviewLink] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const router = useRouter()

  // Form validation
  const isFormValid = collegeName.trim() && workshopName.trim() && date

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
        toast.error("Please fill in all required fields.");
        return;
    }
    setLoading(true);
    setError(null);

    try {
        const uniqueLink = formStatus ? generateRandomString(10) : null;

        await addDoc(collection(db, "workshops"), {
            collegeName,
            workshopName,
            date: date,
            instructions,
            status: formStatus ? "on" : "off",
            uniqueLink,
            createdAt: serverTimestamp(),
        });

        toast.success("Workshop form created successfully!");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1200);
        router.push("/dashboard");

    } catch (error) {
        console.error("Error creating workshop:", error);
        toast.error("Failed to create workshop. Please try again.");
    } finally {
        setLoading(false);
    }
  }

  const generatePreviewLink = () => {
    if (formStatus) {
      const link = generateRandomString(10);
      setPreviewLink(link);
      toast.success("Preview link generated!");
    }
  }

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
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create Workshop Form</h1>
              <p className="text-muted-foreground">
                Set up a new feedback form for your workshop participants.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-400/30 via-blue-400/20 to-purple-400/30 blur-sm z-0" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                  <Save className="h-5 w-5" />
                  Workshop Details
                </CardTitle>
                <CardDescription>
                  Enter the workshop details below. Fields marked with <span className="text-destructive">&quot;*&quot;</span> are required.
                </CardDescription>
              </CardHeader>
              {loading ? (
                <Skeleton className="h-96 w-full rounded-md" />
              ) : (
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-6 relative z-10">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="college-name" className="flex items-center gap-2">
                          College Name
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        </Label>
                        <Input
                          id="college-name"
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          placeholder="e.g., Massachusetts Institute of Technology"
                          required
                          className="transition-all focus:ring-2 focus:ring-primary/30"
                        />
                        <p className="text-xs text-muted-foreground">Enter the full name of the college or institution.</p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="workshop-name" className="flex items-center gap-2">
                          Workshop Name
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        </Label>
                        <Input
                          id="workshop-name"
                          value={workshopName}
                          onChange={(e) => setWorkshopName(e.target.value)}
                          placeholder="e.g., Advanced React Development Workshop"
                          required
                          className="transition-all focus:ring-2 focus:ring-primary/30"
                        />
                        <p className="text-xs text-muted-foreground">Give your workshop a clear, descriptive name.</p>
                      </div>
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                          Workshop Date
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">Select the date when the workshop will take place.</p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="instructions">Instructions for Participants</Label>
                        <Textarea
                          id="instructions"
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          placeholder="Provide clear instructions for students on how to fill out the feedback form..."
                          rows={4}
                          className="transition-all focus:ring-2 focus:ring-primary/30"
                        />
                        <p className="text-xs text-muted-foreground">
                          This will be displayed to participants when they access the form.
                        </p>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label htmlFor="form-status" className="text-base">Form Status</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable this to make the form accessible to participants
                          </p>
                        </div>
                        <Switch 
                          id="form-status" 
                          checked={formStatus} 
                          onCheckedChange={setFormStatus} 
                        />
                      </div>
                      {error && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between relative z-10">
                    <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>Cancel</Button>
                    <Button type="submit" disabled={loading || !isFormValid}>
                      {loading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Create Workshop
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>
          </motion.div>
          {/* Preview Panel */}
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-400/30 via-blue-400/20 to-purple-400/30 blur-sm z-0" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm text-muted-foreground">
                    Use clear, descriptive workshop names for better organization.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm text-muted-foreground">
                    Set the form status to &quot;Active&quot; only when ready to collect feedback.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm text-muted-foreground">
                    Provide clear instructions to help participants understand the feedback process.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 