"use client";

import { useUIStore } from "@/store/ui-store";
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

export function ConfirmationDialog() {
  const { confirmOptions, hideConfirm } = useUIStore();

  const handleCancel = () => {
    hideConfirm();
  };

  const handleConfirm = () => {
    if (confirmOptions?.onConfirm) {
      confirmOptions.onConfirm();
    }
    hideConfirm();
  };

  const isOpen = confirmOptions !== null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent className="font-body max-w-sm rounded-2xl border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-lg font-bold tracking-tight text-foreground">
            {confirmOptions?.title || "Are you sure?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {confirmOptions?.description || "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:space-x-2">
          <AlertDialogCancel onClick={handleCancel} className="rounded-xl border-border/80 hover:bg-muted font-semibold">
            {confirmOptions?.cancelLabel || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
          >
            {confirmOptions?.confirmLabel || "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
