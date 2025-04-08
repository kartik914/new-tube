import { cva, VariantProps } from "class-variance-authority";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "w-9 h-9 text-base",
      xs: "w-4 h-4 text-xs",
      sm: "w-6 h-6 text-sm",
      lg: "w-10 h-10 text-lg",
      xl: "w-[160px] h-[160px] text-5xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string;
  name: string;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar = ({ imageUrl, name, size, className, onClick }: UserAvatarProps) => {
  // TODO: Add a fallback image URL if the imageUrl is empty or invalid
  return (
    <Avatar className={cn(avatarVariants({ size, className }))} onClick={onClick}>
      <AvatarImage src={imageUrl} alt={name} />
      <AvatarFallback>{name.charAt(0).toUpperCase() || "N"}</AvatarFallback>
    </Avatar>
  );
};
