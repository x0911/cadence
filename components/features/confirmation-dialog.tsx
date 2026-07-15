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
      <AlertDialogContent className="max-w-sm rounded-2xl border-border bg-card font-body">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-lg font-bold tracking-tight text-foreground">
            {confirmOptions?.title || "Are you sure?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {confirmOptions?.description || "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:space-x-2">
          <AlertDialogCancel
            onClick={handleCancel}
            className="border-border/80 rounded-xl font-semibold hover:bg-muted hover:text-slate-900"
          >
            {confirmOptions?.cancelLabel || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="hover:bg-accent/90 rounded-xl bg-accent font-semibold text-accent-foreground"
          >
            {confirmOptions?.confirmLabel || "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
