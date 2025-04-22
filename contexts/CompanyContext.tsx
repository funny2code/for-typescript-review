import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { Company } from "@/types/company";
import { useClient } from "./ClientContext";

interface CompanyContextProps {
  companyId: string;
  setCompanyId: (id: string) => void;
  companies: Company[] | undefined;
  setCompanies: (companies: Company[]) => void;
  company: Company | undefined;
  setCompany: (company: Company) => void;
}

export const CompanyContext = createContext<CompanyContextProps>({
  companyId: "",
  setCompanyId: () => {},
  companies: [],
  setCompanies: () => {},
  company: undefined,
  setCompany: () => {},
});

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({
  children,
}) => {
  const [companyId, setCompanyId] = useState<string>("");
  const [company, setCompany] = useState<Company | undefined>();
  const [companies, setCompanies] = useState<Company[] | undefined>();
  const client = useClient();

  useEffect(() => {
    // Load companyId from sessionStorage when component mounts
    const storedCompanyId = sessionStorage.getItem("companyId");
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }

    // Subscribe to company list updates
    const listCompanySub = client.models.Company.observeQuery().subscribe({
      next: ({ items }: { items: any[] }) => {
        setCompanies(items);
        // Automatically set company if companyId is already set
        if (storedCompanyId) {
          const currentCompany = items.find(
            (item) => item.id === storedCompanyId
          );
          if (currentCompany) {
            setCompany(currentCompany);
          }
        }
      },
    });

    return () => {
      listCompanySub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Update sessionStorage whenever companyId changes
    if (companyId) {
      sessionStorage.setItem("companyId", companyId);
    }
  }, [companyId]);

  return (
    <CompanyContext.Provider
      value={{
        companyId,
        setCompanyId,
        companies,
        setCompanies,
        company,
        setCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
