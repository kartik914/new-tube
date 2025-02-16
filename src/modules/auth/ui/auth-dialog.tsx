"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { closeDialog } from "@/redux/features/auth-dialog-slice";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";
import ForgotPasswordForm from "./forgot-password-form";
import NewVerificationForm from "./new-verification-form";
import { ErrorCard } from "./error-card";
import NewPasswordForm from "./new-password-form";
import { useCurrentUser } from "@/hooks/use-current-user";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const AuthDialog = () => {
  const { isOpen, formType } = useSelector((state: RootState) => state.dialog);
  const router = useRouter();
  const path = usePathname();
  const dispatch = useDispatch();
  const user = useCurrentUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    let params = "";

    searchParams.forEach((value, key) => {
      if (key === "dialog") {
        if (value === "close") {
          dispatch(closeDialog());
        }
        return;
      }
      params += `${key}=${value}&`;
    });
    router.replace(path + "?" + params);
  }, [router, path, searchParams, dispatch]);

  if (user) {
    return;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && dispatch(closeDialog())}>
      <DialogTitle className=""></DialogTitle>
      <DialogContent className="w-min p-0">
        <AuthForm />
      </DialogContent>
    </Dialog>
  );

  function AuthForm() {
    if (formType === "login") {
      return <LoginForm />;
    }

    if (formType === "register") {
      return <RegisterForm />;
    }

    if (formType === "forgot-password") {
      return <ForgotPasswordForm />;
    }

    if (formType === "new-verification") {
      return <NewVerificationForm />;
    }

    if (formType === "error") {
      //TODO: Add error message
      return <ErrorCard error="Someting Went Wrong" />;
    }

    if (formType === "new-password") {
      return <NewPasswordForm />;
    }
  }
};

export default AuthDialog;
