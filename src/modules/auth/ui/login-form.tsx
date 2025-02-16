"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { LoginSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/actions/login";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Message } from "@/models/message";
import MessageCard from "@/components/message-card";
import AuthCardWrapper from "./auth-card-wrapper";
import { openDialog } from "@/redux/features/auth-dialog-slice";
import { useDispatch } from "react-redux";

const LoginForm = () => {
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked" ? "Email is already registered with another provider!" : "";
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    if (urlError) {
      setFormMessage({
        type: "error",
        message: urlError,
      });
    }
  }, [urlError]);

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formMessage, setFormMessage] = useState<Message | null>(null);
  const dispatch = useDispatch();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setFormMessage(null);

    startTransition(() => {
      login(values, callbackUrl || undefined)
        .then((data) => {
          if (data?.error || data?.success) {
            setFormMessage({
              type: data?.success ? "success" : "error",
              message: data?.success ? data?.success : data?.error,
            });
          }

          if (data?.twoFactor) {
            setShowTwoFactor(true);
          }
        })
        .catch(() => {
          setFormMessage({
            type: "error",
            message: "Something went wrong!",
          });
        });
    });
  };

  return (
    <AuthCardWrapper
      headerLabel="Welcome Back!"
      backButtonHref="/auth/register"
      onBackClick={() => dispatch(openDialog("register"))}
      backButtonLabel="Don't Have an Account?"
      showSocial={true}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {!showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="example@gmail.com" type="email" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="********" type="password" disabled={isPending} />
                      </FormControl>
                      <Button
                        size={"sm"}
                        className="px-0 font-normal"
                        variant="link"
                        type="button"
                        onClick={() => dispatch(openDialog("forgot-password"))}
                      >
                        Forgot Password
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {showTwoFactor && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123456" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <MessageCard type={formMessage?.type} message={formMessage?.message} />
          <Button type="submit" size="lg" variant="default" className="w-full" disabled={isPending}>
            {showTwoFactor ? "Confirm" : "Login"}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
};

export default LoginForm;
