"use client";

import React, { useEffect } from "react";

import { PageHeading } from "@components/ui/PageHeading";
import SelectCompanyComponent from "@components/SelectCompanyComponent";
import { Button as ShadButton } from "@components/shadcn/ui/button";
import { useClient } from "contexts/ClientContext";
import { useCompany } from "contexts/CompanyContext";
import { useRouter } from "next/navigation";
import { useUserGroups } from "contexts/UserGroupsContext";
import { useDispatch, useSelector } from "react-redux";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { setNewCompanyAction } from "@redux/actions/companyAction";

const Home: React.FC = () => {
  const router = useRouter();
  const { isAgencyClient } = useUserGroups();
  const dispatch = useDispatch();

  const companyState = useSelector(selectCompanyState);
  const { companies } = companyState;

  const handleCreateNewCompany = () => {
    // router.push(`/companies/new`);
    dispatch(setNewCompanyAction(""));
    router.push("/brand-lens");
  };

  if (!companies) return null;

  return (
    <div className="mx-6 mt-6 mb-6">
      <PageHeading title="Select Company" />

      <SelectCompanyComponent companies={companies} userId={"user.username"} />

      {isAgencyClient && (
        <div className="flex gap-2 mt-5 justify-end">
          <ShadButton
            variant={"outline"}
            onClick={() => {
              handleCreateNewCompany();
            }}
          >
            Add Company
          </ShadButton>
        </div>
      )}
    </div>
  );
};

export default Home;
