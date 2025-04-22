import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { fetchAuthSession } from "aws-amplify/auth";

interface UserGroupsContextType {
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isContentEditor: boolean;
  isServicesClient: boolean;
  isAgencyClient: boolean;
  userGroupLoading: boolean;
}

const UserGroupsContext = createContext<UserGroupsContextType>({
  isSuperAdmin: false,
  isCompanyAdmin: false,
  isContentEditor: false,
  isServicesClient: false,
  isAgencyClient: false,
  userGroupLoading: true,
});

interface UserGroupsProviderProps {
  children: ReactNode;
}

export const UserGroupsProvider: React.FC<UserGroupsProviderProps> = ({
  children,
}) => {
  const [userGroupLoading, setUserGroupLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);
  const [isContentEditor, setIsContentEditor] = useState(false);
  const [isServicesClient, setIsServicesClient] = useState(false);
  const [isAgencyClient, setIsAgencyClient] = useState(false);

  useEffect(() => {
    const checkUserGroups = async () => {
      try {
        const { accessToken } = (await fetchAuthSession()).tokens ?? {};
        const accessGroups = accessToken?.payload?.[
          "cognito:groups"
        ] as string[];
        setIsSuperAdmin(accessGroups?.includes("superAdmins"));
        setIsCompanyAdmin(accessGroups?.includes("companyAdmins"));
        setIsContentEditor(accessGroups?.includes("contentEditors"));
        setIsServicesClient(accessGroups?.includes("servicesClients"));
        setIsAgencyClient(accessGroups?.includes("agencyClients"));
      } catch (err) {
        // console.error(err);
      } finally {
        setUserGroupLoading(false);
      }
    };
    checkUserGroups();
  }, []);

  return (
    <UserGroupsContext.Provider
      value={{
        isSuperAdmin,
        isCompanyAdmin,
        isContentEditor,
        isServicesClient,
        isAgencyClient,
        userGroupLoading,
      }}
    >
      {children}
    </UserGroupsContext.Provider>
  );
};

export const useUserGroups = () => useContext(UserGroupsContext);
