"use client";

import { AccountSettings } from "@aws-amplify/ui-react";
import { PageHeading } from "@components/ui/PageHeading";
import React from "react";

const ChangePasswordPage: React.FC = () => {
  const handleSuccess = () => {
    alert("Password has been successfully changed!");
  };

  return (
    <div className="p-6">
      <PageHeading title="Change Password" />
      <h5 className="">
        You will not be able to change your password if you are signed in with Google.
      </h5>
      <div className="mt-5 bg-white p-6 border border-gray-300 rounded-xl">
        <AccountSettings.ChangePassword onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default ChangePasswordPage;
