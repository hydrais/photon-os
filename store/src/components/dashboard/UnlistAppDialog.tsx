import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

type UnlistAppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName: string;
  loading: boolean;
  onConfirm: () => void;
};

export function UnlistAppDialog({
  open,
  onOpenChange,
  appName,
  loading,
  onConfirm,
}: UnlistAppDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlist {appName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will hide your app from the store. Users who have already
            installed it will still be able to use it. You can relist it anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading}>
            {loading ? <Spinner className="size-4" /> : "Unlist App"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
