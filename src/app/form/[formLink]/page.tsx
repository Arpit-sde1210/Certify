"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  Mail, 
  User, 
  MessageSquare,
  ArrowRight,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from "sonner"
import { generateCertificatePDF } from '@/lib/utils';

interface WorkshopData {
    collegeName: string;
    workshopName: string;
    date: { toDate: () => Date };
    instructions: string;
}

function StudentInputForm({ workshopId }: { workshopId: string }) {
    const [name, setName] = useState('');
    const [course, setCourse] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    
    const [emailOtp, setEmailOtp] = useState('');
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);

    const [phoneOtp, setPhoneOtp] = useState('');
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [workshopName, setWorkshopName] = useState('');

    // TODO: Get from deployed function URLs
    const sendEmailOtpUrl = process.env.NEXT_PUBLIC_SEND_EMAIL_OTP_URL!;
    const verifyEmailOtpUrl = process.env.NEXT_PUBLIC_VERIFY_EMAIL_OTP_URL!;
    const sendSmsOtpUrl = process.env.NEXT_PUBLIC_SEND_SMS_OTP_URL!;
    const verifySmsOtpUrl = process.env.NEXT_PUBLIC_VERIFY_SMS_OTP_URL!;

    useEffect(() => {
        // Fetch workshop name for certificate
        const fetchWorkshopName = async () => {
            if (!workshopId) return;
            try {
                const docRef = doc(db, "workshops", workshopId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setWorkshopName(docSnap.data().workshopName || '');
                }
            } catch {
                setWorkshopName('');
            }
        };
        fetchWorkshopName();
    }, [workshopId]);

    const handleSendEmailOtp = async () => {
        setLoading(true);
        try {
            await axios.post(sendEmailOtpUrl, { email });
            setEmailOtpSent(true);
            toast.success("OTP sent to your email address.");
        } catch (error) {
            toast.error("Failed to send OTP. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        setLoading(true);
        try {
            const response = await axios.post(verifyEmailOtpUrl, { email, otp: emailOtp });
            if (response.data.success) {
                setEmailVerified(true);
                toast.success("Email successfully verified.");
            } else {
                toast.error("Invalid OTP. Please try again.");
            }
        } catch (error) {
            toast.error("Failed to verify OTP. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendSmsOtp = async () => {
        setLoading(true);
        try {
            await axios.post(sendSmsOtpUrl, { phone });
            setPhoneOtpSent(true);
            toast.success("OTP sent to your phone number.");
        } catch (error) {
            toast.error("Failed to send SMS OTP. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySmsOtp = async () => {
        setLoading(true);
        try {
            const response = await axios.post(verifySmsOtpUrl, { phone, otp: phoneOtp });
            if (response.data.success) {
                setPhoneVerified(true);
                toast.success("Phone successfully verified.");
            } else {
                toast.error("Invalid SMS OTP. Please try again.");
            }
        } catch (error) {
            toast.error("Failed to verify SMS OTP. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!emailVerified || !phoneVerified) {
            toast.error("Please verify both email and phone number before submitting.");
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, "submissions"), {
                workshopId,
                name,
                course,
                phone,
                email,
                feedback,
                submittedAt: serverTimestamp(),
            });

            toast.success("Your feedback has been submitted successfully! You can now download your certificate.");
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to submit form. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = async () => {
        try {
            const blob = await generateCertificatePDF(name, workshopName);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'certificate.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success('Certificate downloaded!');
        } catch {
            toast.error('Failed to generate certificate.');
        }
    };

    if (submitted) {
        return (
            <div className="space-y-6 text-center">
                <h2 className="text-2xl font-bold">Thank you for your feedback!</h2>
                <p className="text-muted-foreground">You can now download your certificate.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                    <Button onClick={handleDownloadCertificate} size="lg">
                        Download Certificate
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center">
                <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        name && course ? 'bg-primary border-primary text-primary-foreground' : 'border-gray-300'
                    }`}>
                        {name && course ? <CheckCircle className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        emailVerified && phoneVerified ? 'bg-primary border-primary text-primary-foreground' : 'border-gray-300'
                    }`}>
                        {emailVerified && phoneVerified ? <CheckCircle className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        feedback ? 'bg-primary border-primary text-primary-foreground' : 'border-gray-300'
                    }`}>
                        {feedback ? <CheckCircle className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>
                            Please provide your basic information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input 
                                    id="name" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    placeholder="Enter your full name"
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course">Course/Program</Label>
                                <Input 
                                    id="course" 
                                    value={course} 
                                    onChange={e => setCourse(e.target.value)} 
                                    placeholder="Enter your course/program"
                                    required 
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Verification */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Contact Verification
                        </CardTitle>
                        <CardDescription>
                            Please verify your email and phone number
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Email Verification */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                {emailVerified && (
                                    <Badge variant="default" className="bg-green-500">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    placeholder="Enter your email"
                                    required
                                    disabled={emailVerified}
                                    className="flex-1"
                                />
                                <Button 
                                    type="button"
                                    onClick={handleSendEmailOtp}
                                    disabled={!email || emailVerified || loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Send OTP'
                                    )}
                                </Button>
                            </div>
                            {emailOtpSent && !emailVerified && (
                                <div className="flex gap-2">
                                    <Input 
                                        value={emailOtp} 
                                        onChange={e => setEmailOtp(e.target.value)} 
                                        placeholder="Enter OTP"
                                        className="flex-1"
                                    />
                                    <Button 
                                        type="button"
                                        onClick={handleVerifyEmailOtp}
                                        disabled={!emailOtp || loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Verify'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Phone Verification */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                {phoneVerified && (
                                    <Badge variant="default" className="bg-green-500">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input 
                                    id="phone" 
                                    type="tel" 
                                    value={phone} 
                                    onChange={e => setPhone(e.target.value)} 
                                    placeholder="Enter your phone number"
                                    required
                                    disabled={phoneVerified}
                                    className="flex-1"
                                />
                                <Button 
                                    type="button"
                                    onClick={handleSendSmsOtp}
                                    disabled={!phone || phoneVerified || loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Send OTP'
                                    )}
                                </Button>
                            </div>
                            {phoneOtpSent && !phoneVerified && (
                                <div className="flex gap-2">
                                    <Input 
                                        value={phoneOtp} 
                                        onChange={e => setPhoneOtp(e.target.value)} 
                                        placeholder="Enter OTP"
                                        className="flex-1"
                                    />
                                    <Button 
                                        type="button"
                                        onClick={handleVerifySmsOtp}
                                        disabled={!phoneOtp || loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Verify'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Feedback */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Feedback
                        </CardTitle>
                        <CardDescription>
                            Please share your thoughts about the workshop
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            value={feedback} 
                            onChange={e => setFeedback(e.target.value)} 
                            placeholder="Enter your feedback"
                            required
                            className="min-h-[100px]"
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button 
                        type="submit" 
                        size="lg"
                        disabled={!name || !course || !emailVerified || !phoneVerified || !feedback || loading}
                        className="w-full sm:w-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                Submit
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

type PageProps = {
    params: { formLink: string };
};

export default function StudentFormPage({ params }: PageProps) {
    const [workshopData, setWorkshopData] = useState<WorkshopData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkshop = async () => {
            try {
                const workshopsRef = collection(db, "workshops");
                const q = query(workshopsRef, where("formLink", "==", params.formLink));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setError("Workshop not found");
                    setLoading(false);
                    return;
                }

                const workshopDoc = querySnapshot.docs[0];
                setWorkshopData(workshopDoc.data() as WorkshopData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching workshop:", error);
                setError("Failed to load workshop details");
                setLoading(false);
            }
        };

        fetchWorkshop();
    }, [params.formLink]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Loading workshop details...
                </div>
            </div>
        );
    }

    if (error || !workshopData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <h1 className="text-2xl font-bold text-red-500">Error</h1>
                <p className="text-muted-foreground">{error || "Workshop not found"}</p>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">{workshopData.workshopName}</h1>
                    <p className="text-muted-foreground">{workshopData.collegeName}</p>
                    <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{workshopData.date.toDate().toLocaleDateString()}</span>
                    </div>
                </div>

                {workshopData.instructions && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{workshopData.instructions}</p>
                        </CardContent>
                    </Card>
                )}

                <StudentInputForm workshopId={params.formLink} />
            </div>
        </div>
    );
} 