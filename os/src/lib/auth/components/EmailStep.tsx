import { useState, type FormEvent } from "react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";

interface EmailStepProps {
  email: string;
  onSubmit: (email: string) => void;
  onSwitchToSignIn: (email: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function EmailStep({
  email: initialEmail,
  onSubmit,
  onSwitchToSignIn,
  loading = false,
  error,
}: EmailStepProps) {
  const [email, setEmail] = useState(initialEmail);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <>
      <div className="text-center">
        <CardTitle className="text-xl">Get started with Photon OS</CardTitle>
        <CardDescription className="mt-2">
          Enter your email to create an account
        </CardDescription>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            autoComplete="email"
            required
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <CircleAlert className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading && <Spinner className="mr-2 size-4" />}
          Continue
        </Button>
      </form>

      <Separator />

      <Button
        type="button"
        variant="ghost"
        onClick={() => onSwitchToSignIn(email)}
        className="w-full"
      >
        Already have an account?{" "}
        <span className="text-primary ml-1">Sign in</span>
      </Button>
    </>
  );
}
