import { Card, CardDescription } from "@components/shadcn/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/shadcn/ui/dialog";
import { Plus, SparklesIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import SmartEditor from "@components/Novel/SmartEditor";
import { Button as ShadButton } from "@components/shadcn/ui/button";
import { Input as ShadInput } from "@components/shadcn/ui/input";
import { Label as ShadLabel } from "@components/shadcn/ui/label";
import { Textarea as ShadTextarea } from "@components/shadcn/ui/textarea";
import React, { useState } from "react";
import { IConfirmDialog, IPillar } from "interfaces";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import { ICompanyState } from "interfaces";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { updateCompanyAction } from "@redux/actions/companyAction";

interface BrandPillarsSectionProps {
  isLoading: boolean;
  onAddPillar: () => void;
  onFeedbackChange: (feedback: string) => void;
  onUpdatePillars: (updatedPillars: IPillar[]) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  onAddPillarLoading: boolean;
}

const BrandPillarsSection: React.FC<BrandPillarsSectionProps> = ({
  isLoading,
  onAddPillar,
  onFeedbackChange,
  onUpdatePillars,
  isDialogOpen,
  setIsDialogOpen,
  onAddPillarLoading
}) => {
  const dispatch = useDispatch();
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany: brandLens } = companyState;
  const [showConfirmDialog, setShowConfirmDialog] = useState<IConfirmDialog | null>(null);

  const handlePillarInput = (
    index: number,
    field: keyof IPillar,
    value: string
  ) => {
    if (value === "" || !brandLens) {
      return;
    }

    const updatedPillars = brandLens.brandContentPillars.map(
      (pillar: IPillar, i: number) => {
        if (i === index) {
          return { ...pillar, [field]: value };
        }
        return pillar;
      }
    );
    dispatch(updateCompanyAction({ key: "brandContentPillars", value: updatedPillars }));
  };

  const handleRemovePillar = (index: number) => {
    if (!brandLens) return;
    setShowConfirmDialog({
      open: true,
      title: "Confirmation",
      content: `Would you like to remove Content Pillar - "${brandLens.brandContentPillars[index].pillar_name}"?`,
      isConfirm: true,
      handleConfirm: async () => {
        const updatedPillars = brandLens.brandContentPillars.filter(
          (_: any, i: number) => i !== index
        );
        dispatch(updateCompanyAction({ key: "brandContentPillars", value: updatedPillars }));
        await onUpdatePillars(updatedPillars);
      },
    });
  };

  return (
    <Card className="bg-white p-6">
      <div className="flex flex-col gap-8 sm:flex-row sm:gap-12 justify-between">
        <div>
          <h3 className="text-base font-bold">Content Pillars</h3>
          <CardDescription>
            The Content Pillars are main themes or categories that support your content marketing strategy. 
            These are broad areas of focus that align with your business goals and audience interests.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <ShadButton className="flex items-center gap-1">
              <Plus height={"1rem"} width={"1rem"} />
              Add pillar
            </ShadButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add new pillar</DialogTitle>
              <DialogDescription>
                If you&apos;d like, add feedback or a prompt for the AI to
                consider when generating your new content pillar. Otherwise,
                leave the text box blank to generate a new content pillar using
                your brand details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <ShadLabel htmlFor="prompt">Prompt</ShadLabel>
                <ShadTextarea
                  id="prompt"
                  className="bg-white color-black mt-2"
                  placeholder="E.g. The name of this pillar should be Domain Expertise"
                  rows={4}
                  onChange={(event) => onFeedbackChange(event.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <ShadButton
                onClick={onAddPillar}
                disabled={onAddPillarLoading}
                className="flex gap-1"
              >
                <SparklesIcon height={"1rem"} width={"1rem"} />
                Generate new pillar
              </ShadButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8">
        {brandLens && brandLens.brandContentPillars &&
          brandLens.brandContentPillars.map((pillar: IPillar, index: number) => (
            <Card key={index} className="p-6">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-base text-gray-500">
                    {`Pillar ${index + 1}`}
                  </p>
                  <ShadButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemovePillar(index)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-500"
                  >
                    Delete
                  </ShadButton>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <div>
                    <ShadLabel htmlFor={`pillar-name-${index}`}>Name</ShadLabel>
                  </div>
                  <ShadInput
                    id={`pillar-name-${index}`}
                    className="bg-white color-black"
                    value={pillar.pillar_name}
                    onChange={(e) =>
                      handlePillarInput(index, "pillar_name", e.target.value)
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <div className="mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <SparklesIcon height={"1rem"} width={"1rem"} />
                      <ShadLabel htmlFor={`pillar-details-${index}`}>
                        Description
                      </ShadLabel>
                    </div>
                  </div>
                  <SmartEditor
                    key={pillar.pillar_name}
                    fileContent={pillar.pillar_details || ""}
                    setFileContent={(pillar_details) => {
                      handlePillarInput(
                        index,
                        "pillar_details",
                        pillar_details
                      );
                    }}
                    fileName={`brandContentPillars`}
                    index={index}
                  />
                  <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-sm text-muted-foreground">
                      Edit with AI using the smart editor above. Highlight text
                      or begin a new line to get started!
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>
      {showConfirmDialog && (
        <ConfirmDialog
          open={showConfirmDialog.open}
          title={showConfirmDialog.title}
          content={showConfirmDialog.content}
          handleClose={() => {setShowConfirmDialog(null);}}
          isConfirm={showConfirmDialog.isConfirm}
          handleConfirm={() => {
            showConfirmDialog.handleConfirm();
          }}
        />
      )}
    </Card>
  );
};

export default BrandPillarsSection;
