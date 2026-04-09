import toast from "react-hot-toast";

type ToastParams = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  return {
    toast: ({ title, description, variant }: ToastParams) => {
      const message = description ? `${title}: ${description}` : title;
      if (variant === "destructive") {
        toast.error(message);
        return;
      }
      toast.success(message);
    },
  };
}
