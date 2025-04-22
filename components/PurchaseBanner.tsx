import { ArrowRight, SparklesIcon } from "lucide-react";
import React, { useEffect } from "react";

import { sendGTMEvent } from "@next/third-parties/google";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useClient } from "contexts/ClientContext";
import { useUserGroups } from "contexts/UserGroupsContext";
import { useRouter } from "next/navigation";

interface PurchaseBannerProps {}

const PurchaseBanner: React.FC<PurchaseBannerProps> = ({}) => {
  const router = useRouter();
  const [isPurchased, setIsPurchased] = React.useState<null | boolean>(null);
  const [TotalToolsUsed, setTotalToolsUsed] = React.useState<number>(0);
  const client = useClient();
  const { isServicesClient, userGroupLoading } = useUserGroups();

  async function handleFetchUserAttributes() {
    try {
      const userAttributes = await fetchUserAttributes();
      const isPaidMember = userAttributes["custom:isPaidMember"] === "true";

      setIsPurchased(isPaidMember || isServicesClient);
      const { errors: getThreadsError, data: threads } =
        await client.models.Thread.list();
      if (getThreadsError) {
        return;
      }

      setTotalToolsUsed(threads.length);
    } catch (error) {
      // console.log(error);
    }
  }

  const handlePurchaseClick = async () => {
    sendGTMEvent({
      event: "view_plans_clicked",
      timestamp: new Date().toISOString(),
    });
    router.push(`/purchase`);
  };

  useEffect(() => {
    if (!userGroupLoading) {
      handleFetchUserAttributes();
    }
  }, [isServicesClient, userGroupLoading]);

  useEffect(() => {
    if (!userGroupLoading && isPurchased === false) {
      sendGTMEvent({
        event: "purchase_banner_viewed",
        timestamp: new Date().toISOString(),
      });
    }
  }, [isPurchased, userGroupLoading, TotalToolsUsed]);

  if (userGroupLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isPurchased !== null && !isPurchased && (
        <div>
          <div className="bg-gradient-to-r from-[#CBFFDE] to-blue-50 px-6 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
              <div>
                <div className="font-bold flex gap-2">
                  <SparklesIcon height={20} width={20} color="#29B7D6" />
                  <h2
                    className="bg-gradient-to-r from-[#29B7D6] to-[#1CB273] bg-clip-text"
                    style={{ color: "transparent" }}
                  >
                    Try our Premium Account Features
                  </h2>
                </div>
                <p className="text-sm">
                  Get access to premium features and tools by purchasing a
                  premium account
                </p>
              </div>
              <div>
                <button
                  className="flex items-center gap-1 text-sm border-b border-gray-900"
                  onClick={handlePurchaseClick}
                >
                  View plans
                  <ArrowRight height={18} width={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PurchaseBanner;
