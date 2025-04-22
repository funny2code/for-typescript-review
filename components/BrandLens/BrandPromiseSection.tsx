import { Card, CardDescription } from "@components/shadcn/ui/card";

import { Label as ShadLabel } from "@components/shadcn/ui/label";
import { selectAIEditorState } from "@redux/reducers/aieditorReducer";
import { SparklesIcon } from "lucide-react";
import React, { forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import SmartEditor from "@components/Novel/SmartEditor";
import { ICompanyState } from "interfaces";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { updateCompanyAction } from "@redux/actions/companyAction";

interface BrandPromiseSectionProps {
  isLoading: boolean;
}

const BrandPromiseSection = (
  ({ isLoading } : BrandPromiseSectionProps) => {
    const companyState: ICompanyState = useSelector(selectCompanyState);
    const { selectedCompany: brandLens } = companyState;
    const dispatch = useDispatch();

    return (
      <Card id="brand-promise" className="bg-white p-6 mb-4">
        {isLoading && <p>Loading...</p>}
        <div className="mb-8 max-w-[1025px]">
          <h3 className="text-base font-bold">Brand Promise</h3>
          <CardDescription>
            A brand promise is a commitment made by a company to its customers,
            outlining what they can consistently expect from its products or
            services. This promise reflects the core values and mission of the
            brand and serves as a foundation for building trust and loyalty. See
            your companys AI-generated brand promise below.
          </CardDescription>
        </div>
        <div className="mt-2 grid w-full items-center gap-1.5">
          <div className="mb-1.5">
            <div className="flex items-center gap-1.5">
              <SparklesIcon height={"1rem"} width={"1rem"} />
              <ShadLabel htmlFor="brand-promise">
                AI-generated brand promise
              </ShadLabel>
            </div>
          </div>
          <SmartEditor
            key={"brandPromise"}
            fileContent={brandLens?.brandPromise || ""}
            setFileContent={
              (brandPromise: string) =>{
                dispatch(updateCompanyAction({
                  key: "brandPromise",
                  value: brandPromise
                }))
              }
            }
            fileName="brandPromise"
          />
          <div className="flex items-center gap-1.5 mt-1">
            <p className="text-sm text-muted-foreground">
              Edit with AI using the smart editor above. Highlight text or begin
              a new line to get started!
            </p>
          </div>
        </div>
      </Card>
    );
  }
);

// BrandPromiseSection.displayName = "BrandPromiseSection";

export default BrandPromiseSection;
