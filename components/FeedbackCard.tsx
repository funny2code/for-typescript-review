
import React, { useState, useEffect } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./shadcn/ui/card";
import { Button } from "./shadcn/ui/button";
import { PopupButton } from "@typeform/embed-react";

interface FeedbackCardProps {};

const FeedbackCard: React.FC<FeedbackCardProps> = ({}) => {
  const formId: string = process.env.NEXT_PUBLIC_FORM_ID || "";
  const [userId, setUserId] = useState<string | undefined>("");
  const [userEmail, setUserEmail] = useState<string | undefined>("");
  
  const getUserDetails = async () => {
    const userAttributes = await fetchUserAttributes();
    setUserEmail(userAttributes["email"]);
    setUserId(userAttributes["sub"]);
  }

  useEffect(() => {
    if (!userId || !userEmail) getUserDetails();
  }, []);

  return (
    <>
      {userId && userEmail && (
        <Card className="bg-blue-50 border-none">
          <CardHeader>
            <CardTitle>We&apos;d love your feedback</CardTitle>
            <CardDescription>
              We&apos;re always looking to get better. Let us know how we can improve!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" className="w-full bg-blue-900 hover:bg-blue-900/90">
              <PopupButton size={70} id={formId} hidden={{user_id: userId, email: userEmail}}>
                Send feedback
              </PopupButton>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default FeedbackCard;
