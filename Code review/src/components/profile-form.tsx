"use client";

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUser } from '@/lib/actions';
import type { UserProfile } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="bg-[#7278F2] hover:bg-[#7278F2]/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export function ProfileForm({ user }: { user: UserProfile }) {
  const [state, formAction] = useActionState(updateUser, { message: "", success: false });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatarUrl || '');

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Success!" : "Update Failed",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
    }
  }, [state, toast]);

  const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : "D";

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="border border-[#1F1A28] bg-[#060010] rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-[#0D0716] border-b border-[#1F1A28] pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-2xl text-white">Profile Settings</CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Manage your public profile and account settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <form action={formAction}>
          <CardContent className="p-6">
            {/* Profile Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 p-6 bg-[#0D0716] rounded-lg border border-[#1F1A28]">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-[#7278F2]/20">
                  <AvatarImage src={avatarPreview} alt={user.name} className="object-cover" />
                  <AvatarFallback className="bg-[#7278F2] text-white text-2xl font-bold">
                    {nameInitial}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="outline" 
                  size="icon" 
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#7278F2] border-2 border-[#060010] hover:bg-[#7278F2]/90"
                >
                  <Camera className="h-4 w-4 text-white" />
                  <span className="sr-only">Change photo</span>
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  name="avatar"
                />
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-400 mt-1">{user.email}</p>
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={handleAvatarClick}
                  className="mt-3 border border-[#1F1A28] bg-[#0D0716] text-white hover:bg-[#1a1a2e] rounded-lg"
                >
                  Change Photo
                </Button>
              </div>
            </div>
            
            {/* Profile Details Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input 
                    id="username" 
                    name="name" 
                    defaultValue={user.name} 
                    readOnly 
                    disabled 
                    className="bg-[#0D0716] border border-[#1F1A28] text-white placeholder-gray-500 rounded-lg py-5 px-4 focus:ring-2 focus:ring-[#7278F2] focus:border-transparent" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    defaultValue={user.email} 
                    readOnly 
                    disabled 
                    className="bg-[#0D0716] border border-[#1F1A28] text-white placeholder-gray-500 rounded-lg py-5 px-4 focus:ring-2 focus:ring-[#7278F2] focus:border-transparent" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    defaultValue={user.fullName || ''} 
                    placeholder="Your full name" 
                    className="bg-[#0D0716] border border-[#1F1A28] text-white placeholder-gray-500 rounded-lg py-5 px-4 focus:ring-2 focus:ring-[#7278F2] focus:border-transparent transition-all" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    defaultValue={user.phone || ''} 
                    placeholder="Your phone number" 
                    className="bg-[#0D0716] border border-[#1F1A28] text-white placeholder-gray-500 rounded-lg py-5 px-4 focus:ring-2 focus:ring-[#7278F2] focus:border-transparent transition-all" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                <Textarea 
                  id="bio" 
                  name="bio" 
                  defaultValue={user.bio || ''} 
                  placeholder="Tell us a little about yourself" 
                  rows={4} 
                  className="bg-[#0D0716] border border-[#1F1A28] text-white placeholder-gray-500 rounded-lg py-4 px-4 focus:ring-2 focus:ring-[#7278F2] focus:border-transparent transition-all resize-none" 
                />
              </div>
            </div>
          </CardContent>
          
          <div className="border-t border-[#1F1A28] px-6 py-4 bg-[#0D0716] flex justify-end gap-3">
            <Button 
              variant="outline" 
              type="reset"
              className="border border-[#1F1A28] bg-[#060010] text-white hover:bg-[#1a1a2e] rounded-lg px-6 py-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#7278F2] hover:bg-[#7278F2]/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}