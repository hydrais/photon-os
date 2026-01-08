import { useState, type FormEvent } from "react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, CircleAlert } from "lucide-react";

interface ProfileStepProps {
  email: string;
  onSubmit: (displayName: string, password: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function ProfileStep({
  email,
  onSubmit,
  loading = false,
  error,
}: ProfileStepProps) {
  const [displayName, setDisplayName] = useState(email.split("@")[0]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(displayName, password);
  };

  return (
    <>
      <div className="text-center">
        <CardTitle className="text-xl">Create your profile</CardTitle>
        <CardDescription className="mt-2">
          Almost there! Just a few more details.
        </CardDescription>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <CircleAlert className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Username</Label>
          <InputGroup>
            <InputGroupAddon>@</InputGroupAddon>
            <InputGroupInput
              id="username"
              type="text"
              placeholder="username"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </InputGroup>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Must be at least 6 characters
          </p>
        </div>

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading && <Spinner className="mr-2 size-4" />}
          Create Account
        </Button>
      </form>
    </>
  );
}
