import { Button } from "@aws-amplify/ui-react";
import { Button as ShadButton } from "@components/shadcn/ui/button";
import React from "react";

interface NextStepFooterProps {
  nextFunction: () => void;
  saveFunction?: () => void;
  hasSave?: boolean;
  title: string;
  buttonText: string;
  isLoading?: boolean;
  enableNext?: boolean;
  saveFunctionLoading?: boolean;
  id: string;
}

const NextStepFooter: React.FC<NextStepFooterProps> = ({
  nextFunction,
  saveFunction,
  hasSave,
  title,
  buttonText,
  isLoading,
  enableNext = false,
  saveFunctionLoading,
  id,
}) => {
  return (
    <div className=" bottom-0 rounded-lg">
      <div className="flex justify-end items-center mt-5 flex-col gap-2 sm:flex-col md:flex-row 2xl:justify-center">
        <div>
          <div className="p-2">
            <h3 className="text-black text-sm md:text-md !font-dm">{title}</h3>
          </div>
        </div>
        <div className="flex gap-2">
          {hasSave && (
            <ShadButton
              onClick={saveFunction}
              variant={"outline"}
              disabled={saveFunctionLoading}
            >
              Save
            </ShadButton>
          )}

          <Button
            className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 flex gap-1"
            onClick={nextFunction}
            isLoading={isLoading}
            loadingText="Generating..."
            isDisabled={enableNext}
            id={id}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NextStepFooter;
