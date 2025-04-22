"use client";

import { useEffect, useMemo, useState } from "react";

import Filemanager from "@components/Filemanager/Filemanager";
import { getCurrentUser } from "aws-amplify/auth";
import { useClient } from "contexts/ClientContext";
import { ICompany, ICompanyState } from "interfaces";
import { useSelector } from "react-redux";
import { selectCompanyState } from "@redux/reducers/companyReducer";

const FileManagerPage = (/* { params }: { params: { companyId: string } } */) => {
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompanyId: companyId, selectedCompany } = companyState;
  // console.log("companyId: ", companyId, selectedCompany);
  const client: any = useClient();
  const [owners, setOwners] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("");

  const isOwner = useMemo(() => {
    if (!owners.length || currentUser == "") return -1;
    return owners.indexOf(currentUser) !== -1 ? 1 : 0;
  }, [owners, currentUser]);

  useEffect(() => {
    const loadCurrentUserAndOwners = async () => {
      const currentUser = await getCurrentUser();
      const { data: company, errors } = await client.models.Company.get({
        id: companyId,
      });
      const _owners = company?.members;
      const arrayOwners = Array.isArray(_owners) ? _owners : [_owners];

      setOwners(arrayOwners);
      setCurrentUser(currentUser.username);
    };
    loadCurrentUserAndOwners();
  }, []);

  return isOwner == 1 ? (
    <div className="home">
      {companyId && (<Filemanager />)}
    </div>
  ) : isOwner == -1 ? (
    <h3>Loading...</h3>
  ) : (
    <h3>You don&apos;t have access to the current storage.</h3>
  );
};

export default FileManagerPage;