"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Classroom } from "./classroom-home";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  studentName: z.string().min(2, "Your name must be at least 2 characters long."),
  pass: z.string().min(1, "Password is required."),
});

interface JoinClassroomDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  classroom: Classroom;
  onJoin: (classroom: Classroom, studentName: string) => void;
}

export function JoinClassroomDialog({ isOpen, onOpenChange, classroom, onJoin }: JoinClassroomDialogProps) {
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { studentName: "", pass: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.pass === classroom.pass) {
      onJoin(classroom, values.studentName);
      onOpenChange(false);
      form.reset();
    } else {
      setError("Incorrect password. Please try again.");
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      form.reset();
      setError("");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join "{classroom.name}"</DialogTitle>
          <DialogDescription>
            This classroom is protected. Please enter your name and the password to join.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" className="w-full">Join Classroom</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
