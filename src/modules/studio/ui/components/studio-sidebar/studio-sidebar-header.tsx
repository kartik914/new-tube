import { SidebarHeader, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import Link from "next/link";

export const StudioSidebarHeader = () => {
  const user = useCurrentUser();
  const { state } = useSidebar();

  if (!user) {
    return (
      <SidebarHeader className="flex items-center justify-center pb-4">
        <Skeleton className="size-[160px] rounded-full"></Skeleton>
        <div className="flex flex-col items-center mt-2 gap-y-1">
          <Skeleton className="h-4 w-[80px] rounded-md" />
          <Skeleton className="h-3 w-[100px] rounded-md" />
        </div>
      </SidebarHeader>
    );
  }

  // if (state === "collapsed") {
  //   return (
  //     <SidebarMenuItem>
  //       <SidebarMenuButton tooltip="Your Profile" asChild>
  //         <Link href="/users/current">
  //           <UserAvatar
  //             imageUrl={user.image || ""}
  //             name={user.name || "User"}
  //             size="xs"
  //           />
  //           <span className="text-xs">Your Profile</span>
  //         </Link>
  //       </SidebarMenuButton>
  //     </SidebarMenuItem>
  //   );
  // }

  return (
    <SidebarHeader className="flex items-center justify-center pb-4">
      <SidebarMenuItem>
        <SidebarMenuButton className="flex justify-center items-center h-max" tooltip="Your Profile" asChild>
          <Link href="/users/current">
            <UserAvatar
              imageUrl={user.image || ""}
              name={user.name || "User"}
              className="hover:opacity-80 transition-all duration-400"
              size={state === "collapsed" ? "sm" : "xl"}
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {state === "expanded" && (
        <div className="flex flex-col items-center mt-2 gap-y-1">
          <p className="text-sm font-medium">Your Profile</p>
          <p className="text-xs text-muted-foreground">{user.name}</p>
        </div>
      )}
    </SidebarHeader>
  );
};
