import { Loader } from "@aws-amplify/ui-react";
import { PageHeading } from "@components/ui/PageHeading";
import React from "react";
import { useUserGroups } from "contexts/UserGroupsContext";

type AccessGroup =
  | "superAdmin"
  | "companyAdmin"
  | "contentEditor"
  | "servicesClient"
  | "agencyClient";

export function withGroupAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredGroups: AccessGroup[]
) {
  return function WithGroupAccess(props: P) {
    const {
      isSuperAdmin,
      isCompanyAdmin,
      isContentEditor,
      isServicesClient,
      isAgencyClient,
      userGroupLoading,
    } = useUserGroups();

    if (userGroupLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Loader size="large" />
        </div>
      );
    }

    const groupAccess = {
      superAdmin: isSuperAdmin,
      companyAdmin: isCompanyAdmin,
      contentEditor: isContentEditor,
      servicesClient: isServicesClient,
      agencyClient: isAgencyClient,
    };

    const hasAccess = requiredGroups.some((group) => groupAccess[group]);

    if (!hasAccess) {
      return <PageHeading title="Access Denied" />;
    }

    return <WrappedComponent {...props} />;
  };
}
