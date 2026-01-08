import { useState } from "react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Mail } from "lucide-react";
import { supabase } from "../../supabase/client";

interface VerificationStepProps {
  email: string;
  password: string;
  displayName: string;
  onSwitchToSignIn: () => void;
}

export function VerificationStep({
  email,
  password,
  displayName,
  onSwitchToSignIn,
}: VerificationStepProps) {
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split("@")[0],
          },
          emailRedirectTo: `${window.location.origin}/__confirm`,
        },
      });
      if (error) throw error;
      setResendSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend email");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 animate-in zoom-in-50 duration-300">
          <Mail className="size-8 text-primary" />
        </div>

        <div className="text-center">
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription className="mt-2">
            We've sent a verification link to{" "}
            <strong className="text-foreground">{email}</strong>
          </CardDescription>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
        <p>Click the link in the email to activate your account.</p>
        <p>Once verified, you can sign in.</p>
      </div>

      {error && <p className="text-destructive text-sm text-center">{error}</p>}
      {resendSuccess && (
        <p className="text-primary text-sm text-center">
          Verification email sent!
        </p>
      )}

      <Separator />

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={resending}
          className="w-full"
        >
          {resending && <Spinner className="mr-2 size-4" />}
          Resend verification email
        </Button>

        <Button
          variant="ghost"
          onClick={onSwitchToSignIn}
          className="w-full"
        >
          Return to Sign In
        </Button>
      </div>
    </>
  );
}
