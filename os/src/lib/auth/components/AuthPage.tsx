import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "../../supabase/client";
import { AuthCard } from "./AuthCard";
import { StepIndicator } from "./StepIndicator";
import { EmailStep } from "./EmailStep";
import { ProfileStep } from "./ProfileStep";
import { VerificationStep } from "./VerificationStep";
import { SignInForm } from "./SignInForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type AuthMode = "signup" | "signin";
type SignUpStep = "email" | "profile" | "verification";

interface SignUpData {
  email: string;
  password: string;
  displayName: string;
}

const STEP_NUMBER: Record<SignUpStep, number> = {
  email: 1,
  profile: 2,
  verification: 3,
};

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [step, setStep] = useState<SignUpStep>("email");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [data, setData] = useState<SignUpData>({
    email: "",
    password: "",
    displayName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = (email: string) => {
    setDirection("forward");
    setData((prev) => ({ ...prev, email }));
    setStep("profile");
    setError(null);
  };

  const handleProfileSubmit = async (displayName: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password,
        options: {
          data: {
            display_name: displayName || data.email.split("@")[0],
          },
          emailRedirectTo: `${window.location.origin}/__confirm`,
        },
      });
      if (error) throw error;

      setData((prev) => ({ ...prev, password, displayName }));
      setDirection("forward");
      setStep("verification");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setDirection("back");
    if (step === "profile") {
      setStep("email");
    }
    setError(null);
  };

  const handleSwitchToSignIn = (email?: string) => {
    if (email) {
      setData((prev) => ({ ...prev, email }));
    }
    setMode("signin");
    setStep("email");
    setError(null);
  };

  const handleSwitchToSignUp = () => {
    setMode("signup");
    setStep("email");
    setError(null);
  };

  const backButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handleBack}
    >
      <ArrowLeft className="size-4" />
      <span className="sr-only">Go back</span>
    </Button>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-foreground p-4">
      <AuthCard headerLeft={mode === "signup" && step === "profile" ? backButton : undefined}>
        {mode === "signup" && step !== "verification" && (
          <StepIndicator currentStep={STEP_NUMBER[step]} totalSteps={3} />
        )}

        <div
          key={`${mode}-${step}`}
          className={cn(
            "flex flex-col gap-6 animate-in duration-200",
            direction === "forward"
              ? "slide-in-from-right-4 fade-in-0"
              : "slide-in-from-left-4 fade-in-0"
          )}
        >
          {mode === "signup" && step === "email" && (
            <EmailStep
              email={data.email}
              onSubmit={handleEmailSubmit}
              onSwitchToSignIn={handleSwitchToSignIn}
              error={error}
            />
          )}

          {mode === "signup" && step === "profile" && (
            <ProfileStep
              email={data.email}
              onSubmit={handleProfileSubmit}
              loading={loading}
              error={error}
            />
          )}

          {mode === "signup" && step === "verification" && (
            <VerificationStep
              email={data.email}
              password={data.password}
              displayName={data.displayName}
              onSwitchToSignIn={handleSwitchToSignIn}
            />
          )}

          {mode === "signin" && (
            <SignInForm
              initialEmail={data.email}
              onSwitchToSignUp={handleSwitchToSignUp}
            />
          )}
        </div>
      </AuthCard>
    </div>
  );
}
