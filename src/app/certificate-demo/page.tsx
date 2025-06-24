"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateCertificatePDF } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CertificateDemoPage() {
  const [name, setName] = useState("");
  const [workshop, setWorkshop] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (submitted) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleDownload = async () => {
    const blob = await generateCertificatePDF(name, workshop);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "certificate.pdf");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

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
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-lg relative z-10">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-400/30 via-blue-400/20 to-purple-400/30 blur-sm z-0" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl font-bold text-center">Certificate Generator</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Step {submitted ? 2 : 1} of 2</span>
          </div>
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <label className="block mb-1 font-medium">Your Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Enter your name" className="focus:ring-2 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Workshop Name</label>
                  <Input value={workshop} onChange={e => setWorkshop(e.target.value)} required placeholder="Enter workshop name" className="focus:ring-2 focus:ring-primary/30 transition-all" />
                </div>
                <Button type="submit" className="w-full">Continue</Button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="h-10 w-10 text-green-500 animate-bounce" />
                  <p className="text-lg font-semibold">Ready to download your certificate!</p>
                </div>
                {/* Animated Certificate Preview */}
                <motion.div
                  className="rounded-lg border bg-white/80 p-4 mb-2 shadow-md"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                  <div className="font-bold text-primary text-lg">{name || "[Your Name]"}</div>
                  <div className="text-xs text-muted-foreground">for</div>
                  <div className="font-medium text-base">{workshop || "[Workshop Name]"}</div>
                </motion.div>
                <Button onClick={handleDownload} className="w-full">Download Certificate</Button>
                <Button variant="outline" className="w-full mt-2" onClick={() => setSubmitted(false)}>Back</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
} 