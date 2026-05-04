// src/app/report/page.tsx
"use client";

import { useEffect, useState } from "react";
import ReportDisplay from "@/components/ReportDisplay";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { UserReportData } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { STORAGE_KEYS, readLocalJson } from "@/lib/clientStorage";

export default function ReportPage() {
  const [reportData, setReportData] = useState<UserReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoadingReport(true);
    try {
      const parsedData = readLocalJson<UserReportData>(STORAGE_KEYS.GENERATED_REPORT);
      if (parsedData) {
        setReportData(parsedData);
      } else {
        setError("No report data found. Please generate a report first.");
      }
    } catch (e) {
      console.error("Error loading report data from localStorage:", e);
      setError("Failed to load your report data. It might be corrupted.");
    } finally {
      setIsLoadingReport(false);
    }
  }, []);

  if (isLoadingReport) {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle>Error Loading Report</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/questionnaire">Start New Questionnaire</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reportData && !isLoadingReport) { 
     return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle>Report Not Found</CardTitle>
                <CardDescription>We couldn't find any report data. Please complete the questionnaire and payment process first.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild size="lg" className="w-full">
                    <Link href="/questionnaire">Complete Questionnaire</Link>
                </Button>
            </CardContent>
            </Card>
        </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {reportData ? (
        <ReportDisplay report={{
          recommendations: reportData.recommendations,
          questionnaireData: reportData.questionnaireData,
          recipientEmail: reportData.recipientEmail, // Ensure recipientEmail is passed
          generatedAtClient: reportData.generatedAtClient,
         }} />
      ) : (
         <div className="flex items-center justify-center py-12">
           <Card className="w-full max-w-md text-center">
             <CardHeader>
               <CardTitle>Report Unavailable</CardTitle>
               <CardDescription>Your report could not be loaded at this time. It might still be generating or an error occurred.</CardDescription>
             </CardHeader>
             <CardContent>
               <Button asChild>
                 <Link href="/">Return to Homepage</Link>
               </Button>
             </CardContent>
           </Card>
         </div>
      )}
    </div>
  );
}