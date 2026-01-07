import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router";

export function ConfirmPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-foreground p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Confirmed</CardTitle>
          <CardDescription>
            Your email has been successfully verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Your account is now active. Please return to the sign-in page on
            your device to log in.
          </p>
          <Button onClick={() => navigate("/")}>Go to Sign In</Button>
        </CardContent>
      </Card>
    </div>
  );
}
