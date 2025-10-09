
import { getCurrentUser } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from '@/components/auth/back-button';
import { ProfileForm } from '@/components/profile-form';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
       <div className="relative flex min-h-screen w-full justify-center items-center bg-background text-foreground p-4 sm:p-6 lg:p-8">
         <BackButton />
         <Card className="w-full max-w-2xl">
           <CardHeader>
             <CardTitle>User not found</CardTitle>
           </CardHeader>
           <CardContent>
            <p>Could not load user profile.</p>
           </CardContent>
         </Card>
       </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full justify-center items-center bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <BackButton />
      <ProfileForm user={user} />
    </div>
  );
}
