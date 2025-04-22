import { useEffect, useState } from "react";
import { useClient } from "contexts/ClientContext";

type QueryFn<T> = (client: any) => { subscribe: (callbacks: { next: (data: T) => void }) => { unsubscribe: () => void } };

export const useObserveQuery = <T>(
  queryFn: QueryFn<T>,
  dependencies: any[] = []
): T | null => {
  const client = useClient();
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const subscription = queryFn(client).subscribe({
      next: (newData: T) => setData(newData),
    });

    return () => subscription.unsubscribe();
  }, [client, ...dependencies]);

  return data;
};
