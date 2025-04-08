import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const session = useSession();

  if (!session.data?.user) {
    console.error("No user found in session data", session.data);
    throw new Error("User is not authenticated");
  }

  return session.data.user;
};
