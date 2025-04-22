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
import { IConfirmDialog } from "interfaces";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { ICompanyState, IPersona } from "interfaces";
import { updateCompanyAction } from "@redux/actions/companyAction";

interface BrandPersonasSectionProps {
  isLoading: boolean;
  onAddPersona: () => void;
  addPersonaLoading: boolean;
  onFeedbackChange: (feedback: string) => void;
  onUpdatePersonas: (updatedPersonas: IPersona[]) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}


const BrandPersonasSection: React.FC<BrandPersonasSectionProps> = ({
  isLoading,
  onAddPersona,
  onFeedbackChange,
  onUpdatePersonas,
  isDialogOpen,
  setIsDialogOpen,
  addPersonaLoading
}) => {
  const dispatch = useDispatch();
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany: brandLens } = companyState;
  const [showConfirmDialog, setShowConfirmDialog] = useState<IConfirmDialog | null>(null);

  const handlePersonaChange = (
    index: number,
    updatedField: Partial<IPersona>
  ) => {
    if (updatedField.persona_name === ""  || !brandLens) {
      return;
    }

    if (updatedField.persona_details === "") {
      return;
    }

    const updatedPersonas = brandLens.brandPersonas.map(
      (persona: IPersona, i: number) => {
        if (i === index) {
          return { ...persona, ...updatedField };
        }
        return persona;
      }
    );
    dispatch(updateCompanyAction({ key: "brandPersonas", value: updatedPersonas }));
  };

  const handleRemovePersona = async (index: number) => {
    if (!brandLens) return;
    setShowConfirmDialog({
      open: true,
      title: "Confirmation",
      content: `Would you like to remove Brand Persona - "${brandLens.brandPersonas[index].persona_name}"?`,
      isConfirm: true,
      handleConfirm: async () => {
        const updatedPersonas = brandLens.brandPersonas.filter(
          (_: any, i: number) => i !== index
        );
        dispatch(updateCompanyAction({ key: "brandPersonas", value: updatedPersonas }));
        await onUpdatePersonas(updatedPersonas);
      },
    });
  };

  return (
    <Card id="brand-persona" className="bg-white p-6">
      <div className="flex flex-col gap-8 sm:flex-row sm:gap-12 justify-between">
        <div>
          <h3 className="text-base font-bold">Brand Personas</h3>
          <CardDescription>
            Brand personas are fictional representations of a brand&apos;s ideal
            customers, created to help businesses understand and cater to the
            needs, behaviors, and goals of their target audience. View some
            AI-generated examples below.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <ShadButton className="flex items-center gap-1">
              <Plus height={"1rem"} width={"1rem"} />
              Add persona
            </ShadButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add new persona</DialogTitle>
              <DialogDescription>
                If you&apos;d like, add feedback or a prompt for the AI to
                consider when generating your new persona. Otherwise, leave the
                text box blank to generate a new persona using your brand
                details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <ShadLabel htmlFor="prompt">Prompt</ShadLabel>
                <ShadTextarea
                  id="prompt"
                  className="bg-white color-black mt-2"
                  placeholder="E.g. This persona should be between the ages of 20 and 29 years old"
                  rows={4}
                  onChange={(event) => onFeedbackChange(event.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <ShadButton
                disabled={addPersonaLoading}
                onClick={onAddPersona}
                className="flex gap-1"
              >
                <SparklesIcon height={"1rem"} width={"1rem"} />
                Generate new persona
              </ShadButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3 mt-8">
        {brandLens && brandLens.brandPersonas &&
          brandLens.brandPersonas.map((persona: IPersona, index: number) => (
            <Card key={index} className="p-6">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-base text-gray-500">
                    {`Persona ${index + 1}`}
                  </p>
                  <ShadButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemovePersona(index)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-500"
                  >
                    Delete
                  </ShadButton>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <div>
                    <ShadLabel htmlFor={`persona-name-${index}`}>
                      Name
                    </ShadLabel>
                  </div>
                  <ShadInput
                    id={`persona-name-${index}`}
                    className="bg-white color-black"
                    value={persona?.persona_name || ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handlePersonaChange(index, {
                        persona_name: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <div className="mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <SparklesIcon height={"1rem"} width={"1rem"} />
                      <ShadLabel htmlFor={`persona-details-${index}`}>
                        Description
                      </ShadLabel>
                    </div>
                  </div>
                  <SmartEditor
                    key={persona?.persona_name || "persona-details"}
                    fileContent={persona?.persona_details || ""}
                    setFileContent={(content) =>
                      handlePersonaChange(index, {
                        persona_details: content,
                      })
                    }
                    fileName={`brandPersonas`}
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

export default BrandPersonasSection;
