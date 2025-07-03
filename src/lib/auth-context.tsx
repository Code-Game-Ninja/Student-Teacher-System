import React, { createContext, useContext } from "react";

export const AuthContext = createContext({
  user: null,
  userData: null,
  loading: false,
});

export function useAuth() {
  return useContext(AuthContext);
} 