"use client";

import * as mutations from "graphql/mutations";

import {
  FetchUserAttributesOutput,
  fetchUserAttributes,
} from "aws-amplify/auth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Loader } from "@aws-amplify/ui-react";
import { Button as ShadButton } from "@components/shadcn/ui/button";
import { Card } from "@components/shadcn/ui/card";
import { sendGTMEvent } from "@next/third-parties/google";
import { useClient } from "contexts/ClientContext";
import { MoveRight } from "lucide-react";
import moment from "moment";
import { toast } from "sonner";

const PurchaseSuccessPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = useClient();
  const [stripeDetails, setStripeDetails] = useState({
    stripeCustomerID: "",
    stripeSubscriptionId: "",
    stripeExpirationDate: "",
    isPaidMember: false,
    stripePlanType: "",
  });
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined);
  const extractStripeAttributes = (attributes: FetchUserAttributesOutput) => {
    const stripeAttributes = {
      stripeCustomerID: attributes["custom:stripeCustomerID"] || "N/A",
      stripeSubscriptionId: attributes["custom:stripeSubscriptionId"] || "N/A",
      stripeExpirationDate:
        attributes["custom:stripeExpirationDate"] !== "N/A"
          ? moment
              .unix(Number(attributes["custom:stripeExpirationDate"]))
              .format("MMMM Do, YYYY")
          : "N/A",
      isPaidMember: attributes["custom:isPaidMember"] === "true",
      stripePlanType: attributes["custom:stripePlanType"] || "N/A",
      discountId: attributes["custom:discountId"] || "N/A",
      discountType: attributes["custom:discountType"] || "N/A",
      amountPaid: attributes["custom:amountPaid"] || "N/A",
    };
    return stripeAttributes;
  };

  const handleSearchParam = async (checkoutSessionId: string) => {
    const variables = {
      csId: checkoutSessionId,
    };
    try {
      const response = await client.graphql({
        query: mutations.verifyPurchaseHandler,
        variables: variables,
      });
      const redirectUrl = response.data.verifyPurchaseHandler.message;

      if (!redirectUrl) {
        toast.error("Error processing your request", {
          duration: 3000,
          position: "bottom-center",
        });
        return;
      }

      if (!redirectUrl?.includes("null")) {
        // router.push(redirectUrl);
        setRedirectUrl(redirectUrl);
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
    const loadStripeDetails = async () => {
      const userAttributes = await fetchUserAttributes();
      if (userAttributes) {
        const extractedStripeDetails = extractStripeAttributes(userAttributes);
        setStripeDetails(extractedStripeDetails);
        // console.log(extractedStripeDetails);
        if (extractedStripeDetails.isPaidMember) {
          sendGTMEvent({
            event: "purchase_success",
            ecommerce: {
              currency: "USD",
              value: extractedStripeDetails.amountPaid,
              affiliation: extractedStripeDetails.stripePlanType,
              transaction_id: extractedStripeDetails.stripeSubscriptionId,
              coupon: extractedStripeDetails.discountId,
              customerId: extractedStripeDetails.stripeCustomerID,
              isPaidMember: extractedStripeDetails.isPaidMember,
            },
          });
        }
      }
    };

    loadStripeDetails();
  }, []);

  useEffect(() => {
    const checkoutSessionId = searchParams?.get("search");
    if (checkoutSessionId) {
      handleSearchParam(checkoutSessionId);
    }
  }, [searchParams]);

  if (!stripeDetails.stripeCustomerID) {
    return <Loader />;
  }

  if (!stripeDetails.isPaidMember) {
    router.push("/purchase");
  }

  return (
    <div className="font-poppin m-6">
      <h1 className="font-bold mb-5">
        <span className="text-2xl">Your purchase was successful!</span>
      </h1>
      <Card className="p-5 bg-white max-w-[420px]">
        <h3 className="text-base font-bold mb-5">Subscription Plan Details</h3>
        <div className="">
          <div className="flex gap-2">
            <h1 className="text-base">Plan Status:</h1>
            <h1 className="text-base text-green-900">
              {stripeDetails.isPaidMember ? "Active" : ""}
            </h1>
          </div>
          <div className="flex gap-2 mt-1.2 ">
            <h1 className="text-base">Expiration Date:</h1>
            <h1 className="text-base">{stripeDetails.stripeExpirationDate}</h1>
          </div>
          <div>
            <div className="flex flex-col gap-2 mt-5 sm:flex-row">
              <ShadButton onClick={() => router.push("/")} variant={"outline"}>
                Back to home
              </ShadButton>

              <ShadButton onClick={() => router.push("/account")}>
                Manage subscription
              </ShadButton>
            </div>
          </div>
        </div>
      </Card>
      {redirectUrl && (
        <button
          className="text-sm mt-5 flex gap-2 items-center hover:underline"
          onClick={() => router.push(redirectUrl)}
        >
          Return to your tool
          <MoveRight height={"1rem"} width={"1rem"} />
        </button>
      )}
    </div>
  );
};

export default PurchaseSuccessPage;
