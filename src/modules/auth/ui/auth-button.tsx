"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ClapperboardIcon, UserCircleIcon, UserIcon } from "lucide-react";
import LoginButton from "./login-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaSignOutAlt } from "react-icons/fa";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

export const AuthButton = () => {
  const user = useCurrentUser();

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "N"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/users/current">
              <DropdownMenuItem>
                <UserIcon /> My Profile
              </DropdownMenuItem>
            </Link>
            <Link href="/studio">
              <DropdownMenuItem>
                <ClapperboardIcon /> Studio
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <LogoutButton>
            <DropdownMenuItem>
              <FaSignOutAlt />
              Log out
            </DropdownMenuItem>
          </LogoutButton>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <LoginButton redirectTo="/">
        <Button
          variant={"outline"}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-500 border-blue-500/20 rounded-full shadow-none [&svg]:size-4"
        >
          <UserCircleIcon />
          Sign In
        </Button>
      </LoginButton>
    </>
  );
};
