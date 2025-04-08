"use client";

import { useForm } from "react-hook-form";
import AuthCardWrapper from "./auth-card-wrapper";
import { z } from "zod";
import { RegisterSchema } from "@/schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register } from "@/actions/register";
import { useState, useTransition } from "react";
import MessageCard from "@/components/message-card";
import { openDialog } from "@/redux/features/auth-dialog-slice";
import { useDispatch } from "react-redux";

const RegisterForm = () => {
  const dispatch = useDispatch();
  const [isPending, startTransition] = useTransition();
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    message: string | undefined;
  } | null>(null);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setFormMessage(null);

    startTransition(() => {
      register(values).then((data) => {
        setFormMessage({
          type: data.success ? "success" : "error",
          message: data.success ? data.success : data.error,
        });
      });
    });
  };

  return (
    <AuthCardWrapper
      headerLabel="Create an Account!"
      backButtonHref="/auth/login"
      backButtonLabel="Already Have an Account?"
      onBackClick={() => dispatch(openDialog("login"))}
      showSocial={true}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full Name" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <MessageCard type={formMessage?.type} message={formMessage?.message} />
          <Button type="submit" size="lg" variant="default" className="w-full" disabled={isPending}>
            Register
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
};

export default RegisterForm;
