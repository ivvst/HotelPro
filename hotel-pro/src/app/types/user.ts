export interface User {
  _id: string;
  tel?: string;
  email: string;
  username: string;
  created_at: string;
  themes?: string[];
  posts?: string[];
}
export interface UserForAuth {
  id: string;
  username: string;
  email: string;
  token?: string; // ако използваш JWT
  avatar?: string;
  role?: 'user' | 'admin';
}

export interface UserDetailed extends UserForAuth {
  firstName: string;
  lastName: string;
  createdAt?: string;
  updatedAt?: string;
  // добави и други полета ако има
}
