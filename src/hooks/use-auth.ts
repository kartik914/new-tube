"use client";

import { useSession } from "next-auth/react";

export const useAuth = () => {
  const session = useSession();

  return {
    session: session.data,
    isLoggedIn: session.status === "authenticated",
    user: session.data?.user,
    role: session.data?.user?.role,
  };
};
