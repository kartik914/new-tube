import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BackButtonProps {
  href: string;
  label: string;
  onBackClick?: () => void;
}

const BackButton = ({ href, label, onBackClick }: BackButtonProps) => {
  return (
    <Button
      asChild
      variant="link"
      onClick={(e) => {
        if (onBackClick) {
          e.preventDefault();
          onBackClick();
        }
      }}
    >
      <Link className="text-xs" href={href}>
        {label}
      </Link>
    </Button>
  );
};

export default BackButton;
