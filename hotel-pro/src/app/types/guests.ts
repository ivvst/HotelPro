export interface Guest {
  _id?: string; 
  firstName: string;
  lastName: string,
  roomNumber: number;
  birthDate: string;
  nationality: string;
  email: string;
  stayFrom: string;
  stayTo: string;
  cruiseId: string,
  excursions: { _id: string; name: string }[];
  isVIP: boolean;
  vipServices?: string[];
  isRhc?: boolean;
  picture?: string;

}
