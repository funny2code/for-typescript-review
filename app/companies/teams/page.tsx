"use client";

import * as mutations from "graphql/mutations";

import { Button, Loader } from "@aws-amplify/ui-react";
import React, { useEffect, useState } from "react";

import { toast } from "sonner";
import { useClient } from "contexts/ClientContext";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { ICompany, ICompanyState } from "interfaces";

const TeamsPage = () => {
  const router = useRouter();
  const client = useClient();

  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany } = companyState;
  const companyId = selectedCompany?.id || null;

  const [removeLoading, setRemoveLoading] = useState<boolean>(false);
  const [email, setEmail] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [teamMembersDetails, setTeamMembersDetails] = useState<
    Array<{ id: string; email: string }>
  >([]);

  useEffect(() => {
    if (!selectedCompany) {
      router.push("/companies");
    } else {
      const fetchCompanyAndTeamMembers = async () => {
        const owners = selectedCompany.members;
        let ownersArray: string[] = [];
        ownersArray = Array.isArray(owners) ? owners : [owners];
        const details = await Promise.all(
          ownersArray.map(async (teamMemberId) => {
            const response = await getUserInfo(teamMemberId);
            return { id: teamMemberId, email: response || "" };
          })
        );
        
        setTeamMembersDetails(details);
      }
      fetchCompanyAndTeamMembers();
    }
  }, [selectedCompany])

  /* useEffect(() => {
    const fetchCompanyAndTeamMembers = async () => {
      const sub = client.models.Company.observeQuery({
        filter: { id: { eq: cId } },
      }).subscribe({
        next: async ({ items, isSynced }) => {
          setCompany(items[0] as Company);

          if (!items[0]) {
            return;
          }
          const owners = items[0]?.members;
          let ownersArray: string[] = [];
          if (Array.isArray(owners)) {
          } else if (typeof owners === "string") {
            // Code to handle when owners is a single string
          } else {
            // Code to handle when owners is neither an array nor a single string
          }

          if (!owners) {
            return;
          }

          ownersArray = Array.isArray(owners) ? owners : [owners];

          // console.log("ownersArray", ownersArray);

          const details = await Promise.all(
            ownersArray.map(async (teamMemberId) => {
              const response = await getUserInfo(teamMemberId);
              return { id: teamMemberId, email: response || "" };
            })
          );

          setTeamMembersDetails(details);
        },
      });
      return () => sub.unsubscribe();
    };

    fetchCompanyAndTeamMembers();
  }, [cId]); */

  const handlerAddUserToTeamClick = async () => {
    setLoading(true);
    const variables = {
      companyId: companyId as string,
      email: email as string,
    };

    try {
      const response = await client.graphql({
        query: mutations.addTeamMember,
        variables: variables,
      });
      toast.success(
        response.data.addTeamMember.message || "User added to team", {
          duration: 3000,
          position: "bottom-center"
        }
      );
      // console.log("data response", response.data.generate.content);
      setLoading(false);
      // router.reload();
    } catch (error) {
      // console.log(error);
      setLoading(false);
      toast.error("Error adding user to team", {
        duration: 3000,
        position: "bottom-center"
      });
    }
  };

  async function getUserInfo(teamMemberId: string) {
    const variables = { userId: teamMemberId };
    try {
      const { data, errors } = await client.graphql({
        query: mutations.getUserInfo,
        variables: variables,
      });
      return data.getUserInfo.email;
    } catch (error) {
      // console.error(error);
      toast.error("Error fetching user info", {
        duration: 3000,
        position: "bottom-center"
      });
      return "";
    }
  }

  const handleRemoveTeamMember = async (teamMemberId: string) => {
    setRemoveLoading(true);
    const variables = {
      companyId: companyId as string,
      userId: teamMemberId,
    };

    try {
      const response = await client.graphql({
        query: mutations.removeTeamMember,
        variables: variables,
      });
      setRemoveLoading(false);
      toast.success(
        response.data.removeTeamMember.message || "User removed from team", {
          duration: 3000,
          position: "bottom-center"
        }
      );
      // router.reload();
    } catch (error) {
      // console.error(error);
      toast.error("Error removing user from team", {
        duration: 3000,
        position: "bottom-center"
      });
      setRemoveLoading(false);
      // reload everything
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-300 font-poppin m-6">
      <h3 className="text-xl font-bold">Team Management</h3>
      <p className="font-poppin mb-5">Company: {selectedCompany?.companyName}</p>

      <div className="flex flex-col md:flex-row gap-5">
        <div className="basis-1/2 bg-white rounded-lg border border-gray-300 p-5">
          <div className="">
            <h2 className="mb-4 text-lg font-bold">Add Members</h2>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="px-3 block w-full rounded-md py-1.5 border-gray-300 bg-white ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
              placeholder="you@example.com"
              aria-describedby="email-description"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 mb-2" id="email-description">
            Enter the email of the user you want to add to the team.
          </p>
          <button
            onClick={handlerAddUserToTeamClick}
            type="button"
            className="inline-flex items-center gap-x-2 rounded-md bg-[#171717] mt-3 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            {loading && <Loader />}
            {/* <CheckCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" /> */}
            Add User
          </button>
        </div>
        <div className="basis-1/2 bg-white rounded-lg border border-gray-300 p-5">
          <div className="">
            <h2 className="mb-4 text-lg font-bold">Current Team Members</h2>
            <div className="w-full">
              {teamMembersDetails?.map((teamMember, index) => (
                <div key={teamMember.id}>
                  <div className="py-3 border-b border-gray-300 flex items-center justify-between">
                    <div className="mr-2 flex-none">{index + 1}.</div>
                    <div className=" flex-1">{teamMember.email}</div>
                    <div className=" flex-none">
                      <Button
                        variation="primary"
                        size="small"
                        loadingText="loading..."
                        onClick={() => handleRemoveTeamMember(teamMember.id)}
                        isLoading={removeLoading}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
