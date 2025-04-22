"use client";

import React, { ReactNode, createContext, useContext } from "react";

import { Schema } from "amplify/data/resource";
import { generateClient } from "aws-amplify/api";

// Create the client
const client = generateClient<Schema>({
  authMode: "userPool",
});

// Create context
const ClientContext = createContext(client);

export const useClient = () => useContext(ClientContext);

// Provider component
export const ClientProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  );
};
