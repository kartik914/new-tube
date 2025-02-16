"use client";

import { useSearchParams } from "next/navigation";
import AuthCardWrapper from "./auth-card-wrapper";
import { MoonLoader } from "react-spinners";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/new-verification";
import MessageCard from "@/components/message-card";

export const NewVerificationForm = () => {
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    message: string | undefined;
  } | null>(null);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (!token) {
      setFormMessage({
        type: "error",
        message: "Token is missing!",
      });
      return;
    }
    newVerification(token)
      .then((data) => {
        setFormMessage({
          type: data?.success ? "success" : "error",
          message: data?.success ? data?.success : data?.error,
        });
      })
      .catch(() => {
        setFormMessage({
          type: "error",
          message: "Something went wrong!",
        });
      });
  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <AuthCardWrapper
      headerLabel="Confirm Your Email!"
      backButtonHref="/auth/login"
      backButtonLabel="Back to Login"
      showSocial={false}
    >
      <div className="flex items-center w-full justify-center">{!formMessage && <MoonLoader size={24} />}</div>
      <MessageCard type={formMessage?.type} message={formMessage?.message} className="justify-center" />
    </AuthCardWrapper>
  );
};

export default NewVerificationForm;
