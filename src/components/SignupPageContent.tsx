'use client';

// This component is now obsolete as user signup/login has been removed.
// Kept for potential future re-integration if needed, but not actively used.
// import AuthForm from "@/components/AuthForm";
// Firebase imports removed
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// const PENDING_QUESTIONNAIRE_KEY = "pendingQuestionnaireData_v2"; 

export default function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Kept for query param handling if page is accessed
  const { toast } = useToast();

  const handleSignup = async (values: { email: string; password: string }) => {
    toast({
      title: "Account Creation Not Available",
      description: "This application now operates without user accounts. Please proceed via the questionnaire.",
      variant: "destructive",
    });
    const fromQuestionnaire = searchParams.get("fromQuestionnaire") === "true";
    if (fromQuestionnaire) {
      router.push("/payment"); 
    } else {
      router.push("/questionnaire");
    }
    throw new Error("Account creation is disabled.");
  };

  const fromQuestionnaire = searchParams.get("fromQuestionnaire") === "true";
  const proceedLink = fromQuestionnaire ? "/payment" : "/questionnaire";

  // Form removed as AuthForm is no longer used.
  return (
    <div className="text-center py-8">
      <h1 className="text-2xl font-bold mb-4">Account Creation Not Required</h1>
      <p className="mb-4 text-muted-foreground">
        Styla operates without user accounts.
      </p>
      <p className="mb-6">
        {fromQuestionnaire 
          ? "To get your report, " 
          : "To get started, "}
        <Button variant="link" asChild className="p-0 h-auto">
          <Link href={proceedLink}>
            {fromQuestionnaire ? "Proceed to Payment" : "Start the Questionnaire"}
          </Link>
        </Button>
      </p>
    </div>
  );
}
