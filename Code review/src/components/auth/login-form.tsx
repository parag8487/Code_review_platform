"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/actions";
import Logo from "@/components/auth/Logo";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      className="w-full py-3 font-medium rounded-xl bg-white text-black hover:bg-gray-200 transition-all duration-200"
    >
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, { message: "", success: false });
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    const signupMessage = searchParams.get('message');
    if (signupMessage) {
      toast({
        title: "Success!",
        description: signupMessage,
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    // Check if state is defined and has a message before accessing it
    if (state && state.message && !state.success) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6 items-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            src="/logo_in_dark_mode.png"
            alt="Logo"
            className="mx-auto h-12 w-12"
            aria-hidden={true}
          />
        </div>

        <Card className="mt-6 sm:mx-auto sm:w-full sm:max-w-[420px] bg-[#171717] border border-[#2E2F2F] rounded-2xl shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center text-white">
              <h3 className="text-2xl font-semibold">Welcome Back</h3>
              <p className="text-sm text-gray-400">Enter your credentials to access your account.</p>
            </div>
            <form action={formAction} className="space-y-4 mt-4">
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-300"
                >
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  className="mt-2 bg-[#212121] text-white placeholder:text-gray-500 border border-[#2E2F2F] rounded-xl h-10 px-4 focus:border-[#4A4A4A] focus:ring-1 focus:ring-[#4A4A4A] focus:ring-offset-0 transition-colors"
                />
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-300"
                >
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  className="mt-2 bg-[#212121] text-white placeholder:text-gray-500 border border-[#2E2F2F] rounded-xl h-10 px-4 focus:border-[#4A4A4A] focus:ring-1 focus:ring-[#4A4A4A] focus:ring-offset-0 transition-colors"
                />
              </div>

              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-white hover:text-gray-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}