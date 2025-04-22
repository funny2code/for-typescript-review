// hooks/useCompanyAuthorization.ts
import { useEffect, useState } from "react";
import { useClient } from "contexts/ClientContext";

interface UseCompanyAuthorizationResult {
  isAuthorized: boolean;
  isLoading: boolean;
}

export function useCompanyAuthorization(companyId: string): UseCompanyAuthorizationResult {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const client = useClient();

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        setIsLoading(true);
        const { data: company, errors: getCompanyError } = await client.models.Company.get({
          id: companyId,
        });

        setIsAuthorized(!getCompanyError && !!company);
      } catch (error) {
        console.error("Error checking company authorization:", error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (companyId) {
      checkAuthorization();
    } else {
      setIsAuthorized(false);
      setIsLoading(false);
    }
  }, [companyId, client]);

  return { isAuthorized, isLoading };
}
