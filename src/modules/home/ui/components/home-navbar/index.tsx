import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "./search-bar";
import { AuthButton } from "@/modules/auth/ui/auth-button";

export const HomeNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white h-16 flex items-center px-2 pr-5 z-50">
      <div className="flex justify-between items-center gap-4 w-full">
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />
          <Link href="/" className="cursor-pointer hidden md:block">
            <div className="p-4 flex items-center gap-1">
              <Image src={"/logo.svg"} width={32} height={32} alt="Logo" />
              <span className="text-xl font-semibold tracking-tight">NewTube</span>
            </div>
          </Link>
        </div>
        <SearchBar />
        <AuthButton />
      </div>
    </nav>
  );
};
