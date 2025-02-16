"use client";

import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { useDispatch } from "react-redux";
import { openDialog } from "@/redux/features/auth-dialog-slice";

interface LoginButtonProps {
  children: React.ReactNode;
  rediredtTo?: string;
}

const LoginButton = ({ children, rediredtTo }: LoginButtonProps) => {
  const router = useRouter();
  const user = useCurrentUser();
  const dispatch = useDispatch();

  const onLoginDialogClick = () => {
    if (user) {
      router.push(rediredtTo || DEFAULT_LOGIN_REDIRECT);
    } else {
      dispatch(openDialog("login"));
    }
  };

  return (
    <span className="cursor-pointer" onClick={onLoginDialogClick}>
      {children}
    </span>
  );
};

export default LoginButton;
