"use client";

import { useEffect, useMemo, useState } from "react";
import Filemanager from "@components/Filemanager/Filemanager";
import { getCurrentUser } from "aws-amplify/auth";
import { useClient } from "contexts/ClientContext";
import { ICompanyState } from "interfaces";
import { useSelector } from "react-redux";
import { selectCompanyState } from "@redux/reducers/companyReducer";

const FileManagerPage: React.FC = () => {
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompanyId: companyId } = companyState;

  const client = useClient();
  const [owners, setOwners] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const isOwner = useMemo(() => {
    if (!owners.length || !currentUser) return -1;
    return owners.includes(currentUser) ? 1 : 0;
  }, [owners, currentUser]);

  useEffect(() => {
    const loadCurrentUserAndOwners = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        const { data: company, errors } = await client.models.Company.get({
          id: companyId,
        });

        if (errors) {
          console.error("Error fetching company data:", errors);
          return;
        }

        const _owners = company?.members || [];
        const arrayOwners = Array.isArray(_owners) ? _owners : [_owners];

        setOwners(arrayOwners);
        setCurrentUser(currentUser.username);
      } catch (error) {
        console.error("Error loading user and owners:", error);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      loadCurrentUserAndOwners();
    }
  }, [client, companyId]);

  if (loading) {
    return <h3>Loading...</h3>;
  }

  if (isOwner === 0) {
    return <h3>You don&apos;t have access to the current storage.</h3>;
  }

  return (
    <div className="home">
      {companyId && <Filemanager />}
    </div>
  );
};

export default FileManagerPage;