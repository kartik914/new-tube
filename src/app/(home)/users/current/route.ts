import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const GET = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return redirect("/auth/login");
  }

  return redirect(`/users/${user?.id}`);
};
