import { Button } from "@aws-amplify/ui-react";
import React from "react";
import { Schema } from "../../amplify/data/resource";
import { getStageAndButtonText } from "@components/ContentEngine/utls/keywordStages";

type Keyword = Schema["Keyword"]["type"];
interface GenerateButtonProps {
  keyword: Keyword;
  onGenerateClick: () => void;
  size?: "small" | "large";
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  keyword,
  onGenerateClick,
  size = "large",
}) => {
  const { stage, buttonText } = getStageAndButtonText(keyword);

  return (
    <Button
      variation="primary"
      size={size}
      onClick={onGenerateClick}
      className="bg-blue-600 hover:bg-blue-700 transition-colors"
      isDisabled={buttonText.includes("Generating") || stage === "Complete"}
      // isLoading={buttonText.includes("Generating") || stage === "Complete"}
    >
      {buttonText}
    </Button>
  );
};

export default GenerateButton;
