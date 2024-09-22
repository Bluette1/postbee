export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User
  }

  export interface User {
    id: string
    email: string
  }