"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { MainSection } from "./main-section";
import { Separator } from "@/components/ui/separator";
import { PersonalSection } from "./personal-section";
import { useAuth } from "@/hooks/use-auth";
import { SubscriptionsSection } from "./subscriptions-section";

export const HomeSidebar = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Sidebar className="pt-16 z-40 border-none" collapsible="icon">
      <SidebarContent className="bg-background">
        <MainSection />
        <Separator />
        <PersonalSection />
        {isLoggedIn && (
          <>
            <Separator />
            <SubscriptionsSection />
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
