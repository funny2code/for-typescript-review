"use client";

// components/withCompanyAuthorization.tsx
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { useCompanyAuthorization } from "hooks/useCompanyAuthorization";
import { ICompanyState } from "interfaces";
import { useSelector } from "react-redux";

export function withCompanyAuthorization(
  WrappedComponent: React.ComponentType<any>
) {
  return function WithCompanyAuthorization(props: any) {
    const companyState: ICompanyState = useSelector(selectCompanyState);
    const { selectedCompany } = companyState;
    const companyId = selectedCompany?.id;
    const { isAuthorized, isLoading } = useCompanyAuthorization(companyId || "");

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthorized) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="flex flex-col items-center justify-center">
            <p className="text-xl font-bold">No Access</p>
            <p className="text-gray-500">
              You don&apos;t have access to this page
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
