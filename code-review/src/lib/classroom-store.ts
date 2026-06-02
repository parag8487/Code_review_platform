/**
 * In-memory classroom state store.
 * On Vercel serverless, each function instance has its own memory,
 * so we use Ably channels as the real-time source of truth.
 * This store helps with initial state and API operations.
 * 
 * For persistence across cold starts, you'd integrate a database (e.g., Supabase, Upstash Redis).
 * Using global variables to persist state within a single serverless instance's lifetime.
 */

import Ably from "ably";

export interface ClassroomData {
  id: string;
  name: string;
  owner: string;
  pass: string;
}

export interface UserData {
  id: string;
  name: string;
  isOwner: boolean;
  hasPermission: boolean;
}

// Global state (persists across requests within the same serverless instance)
declare global {
  var classroomStore: Map<string, ClassroomData> | undefined;
  var classroomUsersStore: Map<string, UserData[]> | undefined;
}

if (!global.classroomStore) {
  global.classroomStore = new Map<string, ClassroomData>();
}

if (!global.classroomUsersStore) {
  global.classroomUsersStore = new Map<string, UserData[]>();
}

export function getClassrooms(): ClassroomData[] {
  return Array.from(global.classroomStore!.values());
}

export function getClassroom(id: string): ClassroomData | undefined {
  return global.classroomStore!.get(id);
}

export function createClassroom(classroom: ClassroomData): void {
  global.classroomStore!.set(classroom.id, classroom);
  global.classroomUsersStore!.set(classroom.id, []);
}

export function deleteClassroom(id: string): void {
  global.classroomStore!.delete(id);
  global.classroomUsersStore!.delete(id);
}

export function getClassroomUsers(classroomId: string): UserData[] {
  return global.classroomUsersStore!.get(classroomId) || [];
}

export function addUserToClassroom(
  classroomId: string,
  user: UserData
): UserData[] {
  const users = global.classroomUsersStore!.get(classroomId) || [];
  const existing = users.find((u) => u.name === user.name);
  if (!existing) {
    users.push(user);
    global.classroomUsersStore!.set(classroomId, users);
  } else {
    // Update the client ID if reconnecting
    existing.id = user.id;
  }
  return global.classroomUsersStore!.get(classroomId) || [];
}

export function removeUserFromClassroom(
  classroomId: string,
  userId: string
): UserData[] {
  const users = global.classroomUsersStore!.get(classroomId) || [];
  const filtered = users.filter((u) => u.id !== userId);
  global.classroomUsersStore!.set(classroomId, filtered);
  return filtered;
}

export function removeUserByName(
  classroomId: string,
  userName: string
): UserData[] {
  const users = global.classroomUsersStore!.get(classroomId) || [];
  const filtered = users.filter((u) => u.name !== userName);
  global.classroomUsersStore!.set(classroomId, filtered);
  return filtered;
}

export function updateUserPermission(
  classroomId: string,
  userId: string,
  hasPermission: boolean
): UserData[] {
  const users = global.classroomUsersStore!.get(classroomId) || [];
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.hasPermission = hasPermission;
  }
  global.classroomUsersStore!.set(classroomId, users);
  return users;
}

// Helper to broadcast via Ably server-side
let ablyRest: Ably.Rest | null = null;

export function getAblyRest(): Ably.Rest | null {
  if (!ablyRest && process.env.ABLY_API_KEY) {
    ablyRest = new Ably.Rest({ key: process.env.ABLY_API_KEY });
  }
  return ablyRest;
}

export async function broadcastToClassroom(
  classroomId: string,
  event: string,
  data: any
): Promise<void> {
  const ably = getAblyRest();
  if (!ably) return;
  const channel = ably.channels.get(`classroom:${classroomId}`);
  await channel.publish(event, data);
}

export async function broadcastClassroomsList(): Promise<void> {
  const ably = getAblyRest();
  if (!ably) return;
  const channel = ably.channels.get("classrooms-lobby");
  await channel.publish("classrooms-update", {
    classrooms: getClassrooms(),
  });
}
