export interface User {
  id: string;
  email: string;
  name: string;
  is_demo: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
