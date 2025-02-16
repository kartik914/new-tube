import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CardHeaderProps {
  title: string;
  description: string;
}

const Header = ({ title, description }: CardHeaderProps) => {
  return (
    <CardHeader className="text-center">
      <CardTitle className="text-3xl font-semibold drop-shadow-md">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
};

export default Header;
