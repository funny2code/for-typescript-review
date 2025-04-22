import { useEffect, useState } from "react";

import { useClient } from "contexts/ClientContext";

export const useObserveQuery = (
  queryFn: (client: any) => any,
  dependencies: any[] = []
) => {
  const client = useClient();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const subscription = queryFn(client).subscribe({
      next: (data: any) => setData(data),
    });

    return () => subscription.unsubscribe();
  }, dependencies);

  return data;
};
