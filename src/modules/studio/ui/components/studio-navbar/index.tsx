import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/modules/auth/ui/auth-button";
import { StudioUploadModal } from "../studio-upload-modal";

export const StudioNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white h-16 flex items-center justify-between px-2 pr-5 z-50 border-b shadow-md">
      <div className="flex flex-row items-center flex-shrink-0">
        <SidebarTrigger />
        <Link href="/studio" className="items-center p-4 gap-4 cursor-pointer hidden md:block">
          <div className="p-4 flex items-center gap-1">
            <Image src={"/logo.svg"} width={32} height={32} alt="Logo" />
            <span className="text-xl font-semibold tracking-tight">NewStudio</span>
          </div>
        </Link>
      </div>
      <div className="flex flex-row flex-shrink-0 items-center gap-4">
        <StudioUploadModal />
        <AuthButton />
      </div>
    </nav>
  );
};
