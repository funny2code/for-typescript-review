import { Card, CardDescription } from "@components/shadcn/ui/card";
import { useDispatch, useSelector } from "react-redux";

import { Label as ShadLabel } from "@components/shadcn/ui/label";
import { SparklesIcon } from "lucide-react";
import SmartEditor from "@components/Novel/SmartEditor";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { ICompanyState } from "interfaces";
import { updateCompanyAction } from "@redux/actions/companyAction";

interface BrandValuePropositionSectionProps {
  isLoading: boolean;
}

const BrandValuePropositionSection = (({ isLoading }: BrandValuePropositionSectionProps) => {
  const dispatch = useDispatch();
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany: brandLens } = companyState;

  return (
    <Card id="brand-value-prop" className="bg-white p-6 mb-5">
      {isLoading && <p>Loading...</p>}
      <div className="mb-8 max-w-[960px]">
        <h3 className="text-base font-bold">Brand Value Proposition</h3>
        <CardDescription>
          A brand value proposition explains why a customer should choose a
          particular brand over competitors by highlighting the specific
          benefits and advantages of its products or services. See your companys
          brand value proposition below.
        </CardDescription>
      </div>
      <div className="mt-2 grid w-full items-center gap-1.5">
        <div className="mb-1.5">
          <div className="flex items-center gap-1.5">
            <SparklesIcon height={"1rem"} width={"1rem"} />
            <ShadLabel htmlFor="brand-value-prop">
              AI-generated brand value proposition
            </ShadLabel>
          </div>
        </div>
        <SmartEditor
          fileContent={brandLens?.brandValueProp || ""}
          setFileContent={
            (brandValueProp: string) =>{
              dispatch(updateCompanyAction({
                key: "brandValueProp",
                value: brandValueProp
              }))
            }
          }
          fileName="brandValueProp"
        />
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <p className="text-sm text-muted-foreground">
          Edit with AI using the smart editor above. Highlight text or begin a
          new line to get started!
        </p>
      </div>
    </Card>
  );
});
export default BrandValuePropositionSection;
