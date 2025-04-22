// hooks/useCompanyAuthorization.ts
import { useEffect, useState } from "react";

import { useClient } from "contexts/ClientContext";

export function useCompanyAuthorization(companyId: string) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const client = useClient();

  useEffect(() => {
    const checkAuthorization = async () => {
      setIsLoading(true);
      const { data: company, errors: getCompanyError } =
        await client.models.Company.get({
          id: companyId,
        });
      setIsAuthorized(!getCompanyError && !!company);
      setIsLoading(false);
    };
    checkAuthorization();
  }, [companyId]);

  return { isAuthorized, isLoading };
}
