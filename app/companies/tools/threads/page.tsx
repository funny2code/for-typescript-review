"use client";

import { Button } from "@aws-amplify/ui-react";
import { PageHeading } from "@components/ui/PageHeading";
import { setThreadAction } from "@redux/actions/companyAction";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { Schema } from "amplify/data/resource";
import { useClient } from "contexts/ClientContext";
import { ICompanyState } from "interfaces";
import { useRouter } from "next/navigation";
import React from "react";
import Moment from "react-moment";
import { useDispatch, useSelector } from "react-redux";

type Thread = Schema["Thread"]["type"];

const ViewPage = () => {
  const router = useRouter();
  const client = useClient();
  const dispatch = useDispatch();

  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany, selectedTool } = companyState;

  const companyId = selectedCompany?.id,
        toolId = selectedTool?.id;
  
  const [threads, setThreads] = React.useState<Thread[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const getThreads = async () => {
    setIsLoading(true);
    try {
      const { data: company, errors } = await client.models.Company.get({
        id: companyId as string,
      });

      if (errors) {
        throw new Error("Error fetching company");
      }

      if (!company) {
        throw new Error("Company not found");
      }

      const { data: threads, errors: threadErrors } = await company.threads({});

      if (threadErrors) {
        throw new Error("Error fetching threads");
      }

      const filteredThreads = threads.filter(
        (thread) => thread.toolId === toolId
      );
      setThreads(filteredThreads as Thread[]);
      setError(null);
    } catch (err) {
      // console.error("Error in getThreads:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setThreads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const truncateText = (text: string) => {
    const maxLength: number = 80;
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + '...';
    }

    return text;
  }

  React.useEffect(() => {
    getThreads();
  }, []);

  return (
    <div className="flex flex-col gap-5 bg-white p-6 rounded-xl border border-gray-300 m-6">
      <PageHeading title="Tool History" />

      {isLoading ? (
        <div className="text-center">
          <p>Loading tool history...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          {!error && threads.length === 0 && (
            <div className="text-center">
              <p>No history found for this tool</p>
            </div>
          )}

          {threads.map((thread) => (
            <div
              key={thread.id}
              className="p-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  {/* <div className="font-semibold">Thread: {thread.name}</div> */}
                  <div className="font-semibold">{truncateText(`${thread.name}: `)}
                    <Moment format="LLL">{thread.createdAt}</Moment>
                  </div>
                  {/* <div className="text-sm text-gray-500">
                    Created: <Moment format="LLL">{thread.createdAt}</Moment>
                  </div> */}
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      thread.status === "COMPLETED"
                        ? "bg-green-50 text-green-900"
                        : thread.status === "PENDING"
                        ? "bg-yellow-50 text-yellow-900"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {thread.status || "Unknown"}
                  </span>
                  <Button
                    variation="primary"
                    size="small"
                    onClick={() => {
                        dispatch(setThreadAction(thread));
                        router.push(`/companies/tools/threads/thread`);
                      }
                    }
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ViewPage;
