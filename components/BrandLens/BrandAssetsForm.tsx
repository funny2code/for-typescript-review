import { Card, CardDescription } from "@components/shadcn/ui/card";
import { useDispatch, useSelector } from "react-redux";

import React from "react";
import { Input as ShadInput } from "@components/shadcn/ui/input";
import { Label as ShadLabel } from "@components/shadcn/ui/label";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { ICompanyState } from "interfaces";
import { updateCompanyAction } from "@redux/actions/companyAction";

const ALL_SOCIAL_PLATFORMS: string[] = [
  "Twitter",
  "Facebook",
  "Instagram",
  "LinkedIn",
];

const BrandAssetsForm: React.FC = () => {

  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany: brandLens } = companyState;
  
  const dispatch = useDispatch();

  const handleInputChange = (platform: string, newValue: string) => {
    if (!brandLens || !brandLens.socials) return;
    const existingIndex = brandLens.socials.findIndex(
      (s: { platform: string }) => s.platform === platform
    );
    let updatedSocials;
    // console.log("input change", existingIndex, newValue, brandLens.socials);
    if (existingIndex > -1) {
      // Update existing entry
      updatedSocials = [...brandLens.socials];
      updatedSocials[existingIndex] = {platform, handle: newValue};
      // console.log("updated social: ", updatedSocials, existingIndex);
    } else {
      // Add new entry
      updatedSocials = [
        ...brandLens.socials,
        { platform, handle: newValue },
      ];
    }
    // console.log("Updated Socials: ", updatedSocials);
    dispatch(updateCompanyAction({ key: "socials", value: updatedSocials }));
  };

  return (
    <Card id="brand-assets" className="!bg-white p-6 basis-5/12">
      <div className="flex flex-col gap-y-4 ">
        <div className="mb-2">
          <h3 className="text-base font-bold">Brand Assets</h3>
          <CardDescription>
            Optionally, enter links to your company&apos;s social platforms.
          </CardDescription>
        </div>
        <div className="flex flex-col gap-4">
          {ALL_SOCIAL_PLATFORMS.map((platform, index) => {
            const existingSocial = brandLens?.socials.find(
              (s: { platform: string }) => s.platform === platform
            );
            return (
              <div key={index}>
                <div className="mt-2 grid w-full items-center gap-1.5">
                  <ShadLabel className="mb-1.5" htmlFor={platform}>
                    {platform}
                  </ShadLabel>
                  <ShadInput
                    id={platform}
                    placeholder={`${platform} URL`}
                    value={existingSocial?.handle || ""}
                    onChange={(event) =>
                      handleInputChange(platform, event.target.value)
                    }
                    className="bg-white color-black"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default BrandAssetsForm;
