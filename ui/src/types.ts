// TDOO: Get interface from api
export type User = {
  uid: string;
  createdAt: Date;
  role: "anonymous" | "attendee" | "organizer";
  name?: string | undefined;
};
