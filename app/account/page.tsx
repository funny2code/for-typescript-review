"use client";

import * as mutations from "graphql/mutations";

import { Button, Loader, useAuthenticator } from "@aws-amplify/ui-react";
import React, { useEffect } from "react";

import { fetchUserAttributes } from "aws-amplify/auth";
import { sendGTMEvent } from "@next/third-parties/google";
import { useClient } from "contexts/ClientContext";
import { useRouter } from "next/navigation";

type LoadingStates = {
  [key: string]: boolean;
};

const AccountPage: React.FC = () => {
  const router = useRouter();
  const client = useClient();

  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [loadingStates, setLoadingStates] = React.useState<LoadingStates>({});
  const [isPurchased, setIsPurchased] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [hasAttrib, setHasAttrib] = React.useState(false);
  const [isSSO, setIsSSO] = React.useState(false);

  async function handleFetchUserAttributes() {
    try {
      const userAttributes = await fetchUserAttributes();
      const isSSO = userAttributes["identities"] !== undefined;
      setIsSSO(isSSO);
      const isPaidMember = userAttributes["custom:isPaidMember"] === "true";
      const email = userAttributes["email"];
      setIsPurchased(isPaidMember);
      setHasAttrib(true);
      setEmail(email as string);
    } catch (error) {
      // console.log(error);
    }
  }

  const purchaseItem = async (type: string) => {
    setLoadingStates((prev) => ({ ...prev, [type]: true }));
    const variables = {
      packageId: type,
    };
    try {
      const response = await client.graphql({
        query: mutations.purchaseHandler,
        variables: variables,
      });
      const redirectUrl = response.data.purchaseHandler.message;
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    handleFetchUserAttributes();
  }, [user]);

  if (!user || !hasAttrib || !email) {
    return <Loader />;
  }

  return (
    <div>
      <div>
        <div className="bg-white p-2 rounded-xl border border-gray-300 p-6 m-6">
          <div className="mb-5">
            <h3 className="text-xl font-bold">
              Account and Subscription Settings
            </h3>
            <p>Change your password or manage your subscription.</p>
          </div>
          <div className="flex flex-col gap-5 md:flex-row">
            <div className="basis-1/2 border border-gray-300 rounded-lg p-5">
              <div className="mb-5">
                <h1 className="text-lg font-bold">Account Settings</h1>
                <p>Logged in as: {email}</p>
              </div>
              <div className="w-[100%]">
                <Button
                  disabled={isSSO}
                  onClick={() => {
                    router.push("account/change-password");
                  }}
                >
                  Change Password
                </Button>
              </div>
              {/* <div className="w-[100%] border-1">
                <h1>Delete Account </h1>
                <Button
                  variation="primary"
                  onClick={() => {
                    router.push("account/change-password");
                  }}
                >
                  Delete Account
                </Button>
              </div> */}
            </div>
            <div className="basis-1/2 border border-gray-300 rounded-lg p-5">
              <div className="flex flex-col mb-5">
                <h1 className="text-lg font-bold">Subscription Settings</h1>
                {isPurchased ? (
                  <p>You are a premium subscriber!</p>
                ) : (
                  <p>
                    Please select a subscription plan to unlock all features
                  </p>
                )}
              </div>
              <div className="w-[100%] border-1 flex">
                {isPurchased && (
                  <div className="">
                    <Button
                      onClick={() => {
                        purchaseItem("tier-monthly");
                        sendGTMEvent({
                          event: "manage_subscription",
                        });
                      }}
                    >
                      Manage Subscription
                    </Button>
                  </div>
                )}
                {!isPurchased && (
                  <div>
                    <div className="mx-auto">
                      <Button
                        onClick={() => {
                          router.push("/purchase");
                        }}
                      >
                        View Plans
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
