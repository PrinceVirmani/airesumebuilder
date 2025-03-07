"use client";

import { toast as sonnerToast } from "sonner";
import { ReactNode } from "react";

// Define types that match your current usage
type ToastProps = {
    variant?: "default" | "destructive";
    title?: string;
    description?: ReactNode;
    duration?: number;
    onOpenChange?: (open: boolean) => void;
};

// Create a wrapper function that adapts Sonner's API to match your current usage
function toast(props: ToastProps) {
    const { variant, title, description, duration, ...rest } = props;

    const toastFn = variant === "destructive" ? sonnerToast.error : sonnerToast;

    const id = toastFn(title || "", {
        description,
        duration,
        ...rest,
    });

    return {
        id,
        dismiss: () => sonnerToast.dismiss(id),
        update: (props: ToastProps) => {
            sonnerToast.dismiss(id);
            toast(props);
        },
    };
}

// Export a hook that returns the toast function and dismiss method
function useToast() {
    return {
        toast,
        dismiss: sonnerToast.dismiss,
    };
}

export { useToast, toast };
