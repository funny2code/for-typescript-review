"use client";

import {
  Authenticator,
  CheckboxField,
  Link,
  ThemeProvider,
  useAuthenticator,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { GoogleTagManager, sendGTMEvent } from "@next/third-parties/google";
import React, { ReactNode, useEffect, useState } from "react";

import { Hub } from "@aws-amplify/core";
import store from "@redux/store";
import { theme } from "app/theme";
import { fetchUserAttributes } from "aws-amplify/auth";
import { CompanyProvider } from "contexts/CompanyContext";
import { UserGroupsProvider } from "contexts/UserGroupsContext";
import { analytics } from "hooks/useSegment";
import Image from "next/image";
import { Provider as ReduxProvider } from "react-redux";
import PurchaseBanner from "./PurchaseBanner";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import NextBreadcrumb from "./NextBreadcrumb";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";

Hub.listen("auth", async ({ payload }) => {
  switch (payload.event) {
    case "signedIn":
      const userAttributes = await fetchUserAttributes();
      const userEmail = userAttributes["email"];
      sendGTMEvent({ event: "sign_in", userId: payload.data.userId });

      analytics.identify(payload.data.userId, {
        name: payload.data.username,
        email: userEmail as string,
      });

      break;
    case "signedOut":
      sendGTMEvent({ event: "sign_out" });
      analytics.track("AUTH_ACTIONS_SIGNEDOUT", {
        // userId: payload.data.username,
      });
      break;
  }
});

const Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  useEffect(() => {
    const trackUser = async () => {
      try {
        const userAttributes = await fetchUserAttributes();
        const userId = userAttributes.sub; // or any other unique identifier
        sendGTMEvent({
          event: "user_identified",
          userId: userId,
          isAuthenticated: true,
        });
      } catch (error) {
        // User is not authenticated
        sendGTMEvent({
          event: "user_identified",
          isAuthenticated: false,
        });
      }
    };
    trackUser();
  }, []);

  
  const ToasterProvider = () => {
    const { theme } = useTheme() as {
      theme: "light" | "dark" | "system";
    };
    return <Toaster theme={theme} />;
  };

  return (
    <ThemeProvider theme={theme} colorMode="light">
      <Authenticator socialProviders={["google"]}>
        <UserGroupsProvider>
          <ReduxProvider store={store}>
            <ToasterProvider />
            <CompanyProvider>
              {/* <NovelProviders> */}
                <div>
                  <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                  />
                  <div className="lg:pl-72">
                    <TopBar setSidebarOpen={setSidebarOpen} />
                    <div className="">
                      <div>
                        <PurchaseBanner />
                        <div className="p-3" id="breadcrumbs">
                          <NextBreadcrumb 
                            homeElement={'Home'}
                            separator={<span> | </span>}
                            activeClasses='text-amber-500'
                            containerClasses='flex py-5 bg-gradient-to-r from-purple-600 to-blue-600' 
                            listClasses='hover:underline mx-2 font-bold'
                            capitalizeLinks
                          />
                        </div>
                        {children}
                      </div>
                    </div>
                  </div>
                </div>
                <GoogleTagManager
                  gtmId={process.env.NEXT_PUBLIC_GTM_CONTAINER_ID as string}
                />
              {/* </NovelProviders> */}
            </CompanyProvider>
          </ReduxProvider>
        </UserGroupsProvider>
      </Authenticator>
    </ThemeProvider>
  );
};

export default withAuthenticator(Provider, {
  socialProviders: ["google"],
  loginMechanisms: ["email"],
  loginMechanism: "email",
  components: {
    SignIn: {
      Header() {
        return (
          <>
            <div className="flex flex-row items-center justify-center py-6">
              <div className="flex-0 p-2">
                <Link href="https://fomo.ai">
                  <Image
                    alt="Amplify logo"
                    src="/logo.svg"
                    width={200}
                    height={100}
                  />
                </Link>
              </div>
            </div>
            <div className="flex flex-row items-center justify-center">
              <div className="flex-0">
                <div className="text-center font-poppin">
                  <h1 className="text-2xl font-bold mb-1">Welcome</h1>
                  <p className="!bold text-xl p-4">
                    Save time & money with automated AI.
                  </p>
                  <p className="text-gray-500">
                    Sign in to access all the features of Fomo.
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      },
    },
    SignUp: {
      Header() {
        return (
          <div className="text-center pt-8">
            <h1 className="text-2xl font-bold mb-1 font-poppin">
              Create an Account
            </h1>
            <p className="text-gray-500">
              Create an account to access all the features of Fomo.
            </p>
          </div>
        );
      },
      FormFields() {
        const { validationErrors } = useAuthenticator();
        return (
          <>
            <Authenticator.SignUp.FormFields />
            <div className="text-center"></div>
            <CheckboxField
              name="acknowledgement"
              label={label("acknowledgement")}
            />
            <CheckboxField
              errorMessage={validationErrors.privacy as string}
              hasError={!!validationErrors.privacy}
              name="privacy"
              label={label("privacy")}
            />
          </>
        );
      },
    },
  },
  services: {
    async validateCustomSignUp(formData) {
      if (!formData.acknowledgement || !formData.privacy) {
        return {
          acknowledgement: "You must agree to the above policies",
        };
      }
    },
  },
});

function label(type: string) {
  switch (type) {
    case "acknowledgement":
      return (
        <h1>
          I agree with the{" "}
          <Link href="https://fomo.ai/terms/" isExternal={true} color="#174D80">
            Terms and Conditions
          </Link>
        </h1>
      );
    case "privacy":
      return (
        <h1>
          I agree with the{" "}
          <Link
            href="https://fomo.ai/privacy/"
            isExternal={true}
            color="#174D80"
          >
            Privacy Policy
          </Link>
        </h1>
      );
    default:
      return "";
  }
}
