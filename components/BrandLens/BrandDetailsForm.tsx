import { Card, CardDescription } from "@components/shadcn/ui/card";
import { useDispatch, useSelector } from "react-redux";

import React from "react";
import { Input as ShadInput } from "@components/shadcn/ui/input";
import { Label as ShadLabel } from "@components/shadcn/ui/label";
import SmartEditor from "@components/Novel/SmartEditor";
import { SparklesIcon } from "lucide-react";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { ICompanyState } from "interfaces";
import { updateCompanyAction } from "@redux/actions/companyAction";

const BrandDetailsForm = () => {
  const dispatch = useDispatch();
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany: brandLens } = companyState;

  const handleInputChange = (key: string, value: string) => {
    dispatch(updateCompanyAction({ key, value }));
  };

  return (
    <Card id="brand-details" className="!bg-white p-6 basis-7/12">
      <div className="flex flex-col gap-y-4">
        <div className="mb-2">
          <h3 className="text-base font-bold">Brand Details</h3>
          <CardDescription>
            In this first step, enter the name, website, and description of your
            company. This information will be used to generate your brand
            promise.
          </CardDescription>
        </div>
        <div className="mt-2 grid w-full items-center gap-1.5">
          <ShadLabel className="mb-1.5" htmlFor="company-name">
            Company Name
          </ShadLabel>
          <ShadInput
            id="company-name"
            placeholder="Company name"
            value={brandLens?.companyName}
            onChange={(event) =>
              handleInputChange("companyName", event.target.value)
            }
            className="bg-white color-black"
          />
        </div>
        <div className="mt-2 grid w-full items-center gap-1.5">
          <ShadLabel className="mb-1.5" htmlFor="company-website">
            Company Website
          </ShadLabel>
          <ShadInput
            id="company-website"
            placeholder="Company website"
            value={brandLens?.companyWebsite}
            onChange={(event) =>
              handleInputChange("companyWebsite", event.target.value)
            }
            className="bg-white color-black"
          />
        </div>
        <div className="mt-2 grid w-full items-center gap-1.5">
          <div className="mb-1.5">
            <div className="flex items-center gap-1.5">
              <SparklesIcon height={"1rem"} width={"1rem"} />
              <ShadLabel htmlFor="company-desc">Description</ShadLabel>
            </div>
          </div>
          <SmartEditor
            fileContent={brandLens?.companyBackground || ""}
            setFileContent={(companyBackground) =>{
                // console.log("company background track: ", companyBackground);
                handleInputChange("companyBackground", companyBackground)
              }
            }
            fileName="companyBackground"
          />
          <div className="flex items-center gap-1.5 mt-1">
            <p className="text-sm text-muted-foreground">
              Enhance your company description using the smart editor above.
              Highlight text or begin a new line to get started!
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BrandDetailsForm;
