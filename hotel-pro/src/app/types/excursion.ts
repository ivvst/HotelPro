export interface Excursion {
  _id?: string;
  name: string;
  description?: string;
  date: string;
  fromTime: string;
  toTime: string;
  deleteRequested?: boolean;

  capacity?: number; // 0 или undefined = без лимит
  waitlist?: {
    guestId: string;   // ObjectId на госта (string в Angular)
    firstName: string;
    lastName: string;
    email: string;
  }[];

}