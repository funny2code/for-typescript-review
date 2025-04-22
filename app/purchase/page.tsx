"use client";

import * as mutations from "graphql/mutations";

import { Button, Loader, useAuthenticator } from "@aws-amplify/ui-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

import { sendGTMEvent } from "@next/third-parties/google";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useClient } from "contexts/ClientContext";
import { toast } from "sonner";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

const PurchasePage: React.FC = () => {
  const router = useRouter();
  const client = useClient();
  const searchParams = useSearchParams();

  const { user } = useAuthenticator((context) => [context.user]);
  const [isPurchased, setIsPurchased] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [hasAttrib, setHasAttrib] = React.useState(false);
  const [clientReferenceId, setClientReferenceId] = React.useState("");

  async function handleFetchUserAttributes() {
    try {
      const userAttributes = await fetchUserAttributes();
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
      // console.warn(error);
      toast.error("Error processing your request", {
        duration: 3000,
        position: "bottom-center",
      });
    }
  };

  useEffect(() => {
    handleFetchUserAttributes();
  }, [user]);

  useEffect(() => {
    const companyId = searchParams?.get("companyId");
    const toolId = searchParams?.get("toolId");
    const threadId = searchParams?.get("threadId");

    setClientReferenceId(
      `u-${user.username}__c-${companyId}__t-${toolId}__r-${threadId}`
    );
  }, [searchParams, user.username]);

  useEffect(() => {
    sendGTMEvent({
      event: "purchase_page_viewed",
      userId: user.username,
      companyId: searchParams?.get("companyId"),
      toolId: searchParams?.get("toolId"),
      threadId: searchParams?.get("threadId"),
      isPremiumMember: isPurchased,
      timestamp: new Date().toISOString(),
    });
  }, [user.username, searchParams, isPurchased]);

  if (!user || !hasAttrib || !email) {
    return <Loader />;
  }

  return (
    <div>
      <div>
        <div className="bg-white rounded-xl border border-gray-300 p-6 m-6">
          <div className="mx-auto max-w-7xl">
            <div className="w-[100%] border-1 flex">
              {isPurchased && (
                <div>
                  <h2 className="text-xl font-bold leading-6 mb-5">
                    You are already a Premium member!
                  </h2>
                  <Button
                    onClick={() => {
                      purchaseItem("tier-monthly");
                    }}
                  >
                    Manage Subscription
                  </Button>
                </div>
              )}

              {!isPurchased && (
                <stripe-pricing-table
                  style={{ width: "100%" }}
                  pricing-table-id={
                    process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID
                  }
                  publishable-key={
                    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                  }
                  client-reference-id={clientReferenceId}
                  customer-email={email}
                ></stripe-pricing-table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
