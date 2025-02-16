import { Social } from "./social";
import Header from "./header";
import BackButton from "./back-button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface AuthCardWrapperProps {
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  onBackClick?: () => void;
  showSocial?: boolean;
  children: React.ReactNode;
}

const AuthCardWrapper = ({
  headerLabel,
  backButtonLabel,
  backButtonHref,
  onBackClick,
  showSocial = false,
  children,
}: AuthCardWrapperProps) => {
  return (
    <Card className="w-80">
      <Header title="🔐Auth" description={headerLabel} />
      <CardContent className="flex flex-col gap-4">
        {children}
        {showSocial && <Social />}
      </CardContent>
      <CardFooter className="flex justify-center">
        <BackButton href={backButtonHref} label={backButtonLabel} onBackClick={onBackClick} />
      </CardFooter>
    </Card>
  );
};

export default AuthCardWrapper;
