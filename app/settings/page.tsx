"use client";

import { ArrowLongRightIcon } from "@heroicons/react/20/solid";
import { Collection } from "@aws-amplify/ui-react";
import { PageHeading } from "@components/ui/PageHeading";
import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserGroups } from "contexts/UserGroupsContext";
import { useSelector } from "react-redux";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { ICompanyState } from "interfaces";

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany } = companyState;
  const companyId = selectedCompany?.id;
  const userGroups = useUserGroups();

  const settings = [
    {
      title: "Company Settings",
      identifier: "company-settings",
      path: "/companies",
      description: "manage Company Settings",
      requiredGroups: [], // Available to all users
    },
    {
      title: "Profile and Subscriptions",
      identifier: "profile-management",
      path: "/account",
      description: "manage Profile Settings",
      requiredGroups: [], // Available to all users
    },
    {
      title: "Team Management",
      identifier: "team-management",
      path: companyId ? `/companies/teams` : "/",
      description:
        "manage team members and their roles. This includes adding or removing members, assigning roles, and managing team-specific preferences.",
      requiredGroups: [], // Available to all users
    },
    {
      title: "Admin Settings",
      identifier: "admin-settings",
      path: "/admin",
      requiredGroups: ["isSuperAdmin"],
      description:
        "manage the overall system settings. This includes managing user roles, system preferences, security settings, and other administrative tasks.",
    },
    {
      title: "Services Client Settings",
      identifier: "services-client-settings",
      path: "/services-client",
      requiredGroups: ["isServicesClient"],
      description:
        "manage the services client settings. This includes managing user roles, system preferences, security settings, and other administrative tasks.",
    },
    {
      title: "Content Editor Settings",
      identifier: "content-editor-settings",
      path: "/content-editor",
      requiredGroups: ["isContentEditor"],
      description:
        "manage the content editor settings. This includes managing user roles, system preferences, security settings, and other administrative tasks.",
    },
    {
      title: "Agency Client Settings",
      identifier: "agency-client-settings",
      path: "/agency-client",
      requiredGroups: ["isAgencyClient"],
      description:
        "manage the agency client settings. This includes managing user roles, system preferences, security settings, and other administrative tasks.",
    },
  ];

  const hasRequiredGroup = (requiredGroups: string[]) => {
    if (requiredGroups.length === 0) return true;
    return requiredGroups.some(
      (group) => userGroups[group as keyof typeof userGroups]
    );
  };

  const filteredSettings = settings.filter((setting) =>
    hasRequiredGroup(setting.requiredGroups)
  );

  const handleSettingClick = async (path: string) => {
    try {
      await router.push(path);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error(
        "Unable to navigate to the selected setting. Please try again."
      );
    }
  };

  return (
    <div className="m-6">
      <PageHeading title="Settings" />
      <div className="mt-5">
        <Collection
          type="list"
          items={filteredSettings}
          gap="1.5rem"
          direction="row"
        >
          {(item, index) => (
            <div
              className="cursor-pointer p-4 bg-white rounded-lg border border-gray-300 hover:bg-blue-50 w-[400px]"
              key={index}
              onClick={() => handleSettingClick(item.path)}
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <h1>{item.title}</h1>
                </div>
                <div className="flex-none">
                  <ArrowLongRightIcon
                    className="h-5 w-5 flex-shrink-0 text-[#171717] cursor-pointer"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          )}
        </Collection>
      </div>
    </div>
  );
};

export default SettingsPage;
