"use client";

import { useForm } from "react-hook-form";
import AuthCardWrapper from "./auth-card-wrapper";
import { z } from "zod";
import { NewPasswordSchema } from "@/schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { newPassword } from "@/actions/new-password";
import { useSearchParams } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MessageCard from "@/components/message-card";
import { Button } from "@/components/ui/button";

const NewPasswordForm = () => {
  const [isPending, startTransition] = useTransition();
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    message: string | undefined;
  } | null>(null);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    setFormMessage(null);

    startTransition(() => {
      newPassword(values, token).then((data) => {
        setFormMessage({
          type: data?.success ? "success" : "error",
          message: data?.success ? data?.success : data?.error,
        });
      });
    });
  };

  return (
    <AuthCardWrapper headerLabel="Set New Password" backButtonHref="/auth/login" backButtonLabel="Back to Login">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="********" type="password" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <MessageCard type={formMessage?.type} message={formMessage?.message} />
          <Button type="submit" size="lg" variant="default" className="w-full" disabled={isPending}>
            Set New Password
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
};

export default NewPasswordForm;
