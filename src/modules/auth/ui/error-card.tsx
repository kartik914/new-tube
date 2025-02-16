import { TriangleAlertIcon } from "lucide-react";
import AuthCardWrapper from "./auth-card-wrapper";

interface ErrorCardProps {
  error: string;
}

export const ErrorCard = ({ error }: ErrorCardProps) => {
  return (
    <AuthCardWrapper
      headerLabel="Oops! Something went wrong!"
      showSocial={false}
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <div className="flex flex-row justify-center items-center gap-2 w-full text-center text-sm text-destructive bg-destructive/15 p-2 rounded-md">
        <TriangleAlertIcon />
        {error}
      </div>
    </AuthCardWrapper>
  );
};
