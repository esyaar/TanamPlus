export interface User {
    id: string;
    name: string;
    role: string;
  }
  
  export interface StoreProps {
    userStore: {
      setCurrentUser: (user: User) => void;
    };
  }
  