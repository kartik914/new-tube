import { cn } from "@/lib/utils";
import { CircleCheck, TriangleAlertIcon } from "lucide-react";

interface MessageCardProps {
  message?: string;
  type: "error" | "success" | undefined;
  className?: string;
}

const MessageCard = ({ message, type, className }: MessageCardProps) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        "w-full p-2 text-sm rounded-md flex flex-row items-center gap-2",
        type === "error" ? "bg-destructive/15 text-destructive" : "bg-emerald-500/15 text-emerald-500",
        className
      )}
    >
      {type === "error" ? <TriangleAlertIcon className="w-5 h-5" /> : <CircleCheck className="w-5 h-5" />} {message}
    </div>
  );
};

export default MessageCard;
