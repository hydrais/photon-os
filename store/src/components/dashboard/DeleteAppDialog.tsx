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

type DeleteAppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName: string;
  loading: boolean;
  onConfirm: () => void;
};

export function DeleteAppDialog({
  open,
  onOpenChange,
  appName,
  loading,
  onConfirm,
}: DeleteAppDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {appName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The app will be permanently removed
            from the store, including all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            variant="destructive"
          >
            {loading ? <Spinner className="size-4" /> : "Delete Permanently"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
