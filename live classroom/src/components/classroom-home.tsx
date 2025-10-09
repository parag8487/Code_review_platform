"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateClassroomDialog } from "@/components/create-classroom-dialog";
import { JoinClassroomDialog } from "@/components/join-classroom-dialog";
import { DoorOpen, Plus, Users, Bot, Code, RefreshCw, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import io, { Socket } from "socket.io-client";

export interface Classroom {
  id: string;
  name: string;
  owner: string;
  pass: string;
}

let socket: Socket;

export function ClassroomHome() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [joiningClassroom, setJoiningClassroom] = useState<Classroom | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch("/api/socket");
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      socket = io(siteUrl, {
        path: "/api/socket_io",
        addTrailingSlash: false,
      });

      socket.on("connect", () => {
        console.log("Connected to socket.io server");
        socket.emit("get-classrooms");
      });
      
      socket.on("classrooms-update", (updatedClassrooms: Classroom[]) => {
        setClassrooms(updatedClassrooms);
      });
    };
    
    socketInitializer();

    return () => {
      if(socket) {
        socket.disconnect();
      }
    }
  }, []);

  const handleCreateClassroom = (classroom: Omit<Classroom, "id">) => {
    const newClassroom = { ...classroom, id: crypto.randomUUID() };
    if (socket) {
      socket.emit("create-classroom", newClassroom);
    }
    router.push(`/classroom/${newClassroom.id}?owner=true&userName=${classroom.owner}`);
  };

  const handleJoinClassroom = (classroom: Classroom, studentName: string) => {
    router.push(`/classroom/${classroom.id}?userName=${studentName}`);
  };

  const handleRefresh = () => {
    if (socket) {
      socket.emit("get-classrooms");
    }
  };

  const filteredClassrooms = classrooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-background font-body">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
             <Bot size={28} className="text-accent"/>
            <h1 className="text-2xl font-bold tracking-tight">ClassroomLive</h1>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2" />
            Create Classroom
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Collaborative Coding, Simplified.
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
              Create your own private classroom, invite students, and start coding
              together in a real-time, shared editor.
            </p>
        </section>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for a classroom..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleRefresh} className="w-full sm:w-auto">
            <RefreshCw className="mr-2" />
            Refresh
          </Button>
        </div>


        {filteredClassrooms.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredClassrooms.map((room) => (
              <Card key={room.id} className="flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                 <div className="relative h-40 w-full">
                    <Image
                      src="https://picsum.photos/400/200"
                      alt="Classroom hero image"
                      fill
                      className="object-cover"
                      data-ai-hint="code abstract"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                 </div>
                <CardHeader className="flex-grow">
                  <CardTitle className="truncate">{room.name}</CardTitle>
                   <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{room.owner.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{room.owner}'s room</span>
                  </div>
                </CardHeader>
                <CardContent>
                   <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4"/>
                        <span>1 participant</span>
                   </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => setJoiningClassroom(room)}
                  >
                    <DoorOpen className="mr-2" />
                    Join Classroom
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="mx-auto w-fit rounded-full bg-card p-6 border shadow-sm">
                <Code className="h-16 w-16 text-accent" />
            </div>
            <h2 className="mt-8 text-2xl font-semibold">{searchTerm ? "No Matches Found" : "No Classrooms Available"}</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              {searchTerm 
                ? "No classrooms matched your search. Try a different term or create a new classroom."
                : "It looks like there are no active classrooms right now. Why not be the first to create one?"
              }
            </p>
            <Button size="lg" className="mt-8" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2" />
                Create a Classroom
            </Button>
          </div>
        )}
      </main>

      <CreateClassroomDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onClassroomCreate={handleCreateClassroom}
      />

      {joiningClassroom && (
        <JoinClassroomDialog
          isOpen={!!joiningClassroom}
          onOpenChange={() => setJoiningClassroom(null)}
          classroom={joiningClassroom}
          onJoin={handleJoinClassroom}
        />
      )}
    </div>
  );
}
