"use client";

import { useForm } from "react-hook-form";
import AuthCardWrapper from "./auth-card-wrapper";
import { z } from "zod";
import { ResetSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { reset } from "@/actions/reset";
import MessageCard from "@/components/message-card";
import { openDialog } from "@/redux/features/auth-dialog-slice";
import { useDispatch } from "react-redux";

const ForgotPasswordForm = () => {
  const dispatch = useDispatch();
  const [isPending, startTransition] = useTransition();
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    message: string | undefined;
  } | null>(null);

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    setFormMessage(null);

    startTransition(() => {
      reset(values).then((data) => {
        setFormMessage({
          type: data?.success ? "success" : "error",
          message: data?.success ? data?.success : data?.error,
        });
      });
    });
  };

  return (
    <AuthCardWrapper
      headerLabel="Forgot Your password?"
      backButtonHref="/auth/login"
      backButtonLabel="Back to Login"
      onBackClick={() => dispatch(openDialog("login"))}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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
          </div>
          <MessageCard type={formMessage?.type} message={formMessage?.message} />
          <Button type="submit" size="lg" variant="default" className="w-full" disabled={isPending}>
            Send Reset Email
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
};

export default ForgotPasswordForm;
