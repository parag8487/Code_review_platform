"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { signup } from "@/lib/actions";
import Logo from "@/components/auth/Logo";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "./password-strength";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      className="w-full py-3 font-medium rounded-xl bg-white text-black hover:bg-gray-200 transition-all duration-200"
    >
      {pending ? "Creating Account..." : "Create Account"}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(signup, { message: "", success: false });
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: state.message,
      });
    }
  }, [state, toast]);

  const handleSubmit = async (formData: FormData) => {
    // Check if passwords match before submitting
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Password and confirm password do not match.",
      });
      return;
    }
    
    // If passwords match, proceed with the signup action
    return formAction(formData);
  };

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
            <div className="text-center text-white pb-2">
              <h3 className="text-2xl font-semibold">Create an account</h3>
              <p className="text-sm text-gray-400">Welcome! Create an account to get started.</p>
            </div>
            <form action={handleSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-300"
                >
                  Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  className="mt-2 bg-[#212121] text-white placeholder:text-gray-500 border border-[#2E2F2F] rounded-xl h-10 px-4 focus:border-[#4A4A4A] focus:ring-1 focus:ring-[#4A4A4A] focus:ring-offset-0 transition-colors"
                />
              </div>

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
                  autoComplete="new-password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 bg-[#212121] text-white placeholder:text-gray-500 border border-[#2E2F2F] rounded-xl h-10 px-4 focus:border-[#4A4A4A] focus:ring-1 focus:ring-[#4A4A4A] focus:ring-offset-0 transition-colors"
                />
                <PasswordStrength password={password} />
              </div>

              <div>
                <Label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-gray-300"
                >
                  Confirm password
                </Label>
                <Input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2 bg-[#212121] text-white placeholder:text-gray-500 border border-[#2E2F2F] rounded-xl h-10 px-4 focus:border-[#4A4A4A] focus:ring-1 focus:ring-[#4A4A4A] focus:ring-offset-0 transition-colors"
                />
              </div>

              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-white hover:text-gray-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}