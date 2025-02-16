import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "./search-bar";
import { AuthButton } from "@/modules/auth/ui/auth-button";

export const HomeNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white h-16 flex items-center justify-between px-2 pr-5 z-50">
      <div className="flex flex-row items-center flex-shrink-0">
        <SidebarTrigger />
        <Link href="/" className="flex items-center p-4 gap-4 cursor-pointer">
          <Image src={"/logo.svg"} width={32} height={32} alt="Logo" />
          <span className="text-xl font-semibold tracking-tight">NewTube</span>
        </Link>
      </div>

      <SearchBar />
      <AuthButton />
    </nav>
  );
};
