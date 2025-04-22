"use client";

import {
  Button,
  Flex,
  Input,
  Label,
  Text,
  TextAreaField,
} from "@aws-amplify/ui-react";
import React, { useEffect, useState } from "react";

// External libraries
import Modal from "@components/ui/Modal";
import { PageHeading } from "@components/ui/PageHeading";
import { sendGTMEvent } from "@next/third-parties/google";
import { toast } from "sonner";
import { useClient } from "contexts/ClientContext";
// Internal modules
import { useCompany } from "contexts/CompanyContext";
import { useUserGroups } from "contexts/UserGroupsContext";

const NewCompanyPage: React.FC = () => {
  let [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const client = useClient();
  const { isServicesClient } = useUserGroups();
  // const router = useRouter();
  const { setCompanyId, companyId, setCompany, companies } = useCompany();
  const [companyBackground, setCompanyBackground] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [companyWebsite, setCompanyWebsite] = useState<string>("");
  const [hasError, setHasError] = React.useState(false);
  const [hasCompanyAssigned, setHasCompanyAssigned] = React.useState(false);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const createCompanyHandler = async () => {
    setIsLoading(true);

    if (!companyName || !companyBackground) {
      toast.error("Company Name and Description are required");
      setIsLoading(false);
      return;
    }

    try {
      const { data: company, errors } = await client.models.Company.create({
        companyName: companyName,
        companyBackground: companyBackground,
        companyWebsite: companyWebsite,
      });
      if (!company) {
        // console.error("Error creating company", errors);
        return;
      }

      setCompanyId(company.id);
      setCompany(company);
      sendGTMEvent({
        event: "create_company",
        company_name: companyName,
      });

      openModal();
    } catch (error) {
      // console.log(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (companies && companies.length > 0) {
      setHasCompanyAssigned(true);
    }
  }, [companies]);

  if (!companies) {
    return <div>Loading...</div>;
  }
  return (
    <div className="mx-6 mt-6 mb-6">
      <PageHeading title="New Company" />
      <div className="bg-white p-5 rounded-xl border border-gray-300 mt-5">
        {hasCompanyAssigned && !isServicesClient && (
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">
              You already Have a company Created
            </h2>
          </div>
        )}
        {(!hasCompanyAssigned || isServicesClient) && (
          <div className="">
            <div>
              <Flex as="form" direction="column">
                <Flex direction="column" gap="large">
                  <Label>
                    Company Name
                    <Text as="span" fontSize="small" color="#CA390B">
                      {" "}
                      (required)
                    </Text>
                  </Label>
                  <Input
                    placeholder="Enter Company Name"
                    style={{ backgroundColor: "#F9F9F9" }}
                    title="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    isRequired={true}
                  />
                  <Label>
                    Company Description{" "}
                    <Text as="span" fontSize="small" color="#CA390B">
                      {" "}
                      (required)
                    </Text>
                  </Label>
                  <TextAreaField
                    label="Company Description"
                    labelHidden={true}
                    style={{ backgroundColor: "#F9F9F9" }}
                    placeholder="Enter Company Description"
                    value={companyBackground}
                    onChange={(e) => setCompanyBackground(e.target.value)}
                    isRequired={true}
                  />
                  {/* TODO: should we add Company Website on the form? */}
                  <Label className="!text-fomored-500">Company Website</Label>
                  <Input
                    placeholder="Enter Company Website"
                    style={{ backgroundColor: "#F9F9F9" }}
                    title="Company Website"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                  <Button
                    isLoading={isLoading}
                    disabled={isLoading}
                    onClick={createCompanyHandler}
                    variation="primary"
                    loadingText="Creating Company..."
                  >
                    Create Company
                  </Button>
                </Flex>
              </Flex>
            </div>
          </div>
        )}
        <div className="mt-4">
          <Modal
            open={isOpen}
            setOpen={setIsOpen}
            companyId={companyId}
            companyName={companyName}
          />
        </div>
      </div>
    </div>
  );
};

export default NewCompanyPage;
