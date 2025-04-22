"use client";

import {
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Radio,
  RadioGroupField,
  Text,
  View,
} from "@aws-amplify/ui-react";
import React, { useState } from "react";

import { Input } from "@components/shadcn/ui/input";
import { Label } from "@components/shadcn/ui/label";
import { Schema } from "amplify/data/resource";
import { Textarea } from "@components/shadcn/ui/textarea";

type Keyword = Schema["Keyword"]["type"];
type Product = Schema["Product"]["type"];
type Company = Schema["Company"]["type"];

interface PreOutlineComponentProps {
  keyword: Keyword;
  company: Company;
  product: Product;

  saveTitle: (title: string) => void;
}

const PreOutlineComponent: React.FC<PreOutlineComponentProps> = ({
  keyword,
  company,
  product,

  saveTitle,
}) => {
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [customTitle, setCustomTitle] = useState<string>("");
  const [additionalInstructions, setAdditionalInstructions] =
    useState<string>("");

  const handleApprove = () => {
    if (selectedTitle === "custom" && customTitle) {
      saveTitle(customTitle);
    } else if (selectedTitle) {
      saveTitle(selectedTitle);
    } else {
      console.log("Please select or enter a title before approving");
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";

    const statusMap: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      "in progress": "bg-blue-100 text-blue-800",
    };

    return statusMap[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-6">
      <Flex direction="column" gap="1rem">
        <Heading level={3} className="text-3xl font-bold text-gray-800">
          {keyword?.keyword}
        </Heading>

        <Flex direction="row" alignItems="center" gap="1rem">
          <Badge
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
              keyword?.status as string
            )}`}
          >
            {keyword?.status}
          </Badge>
          <Text className="text-gray-600 font-medium">
            Phase: {keyword?.phase}
          </Text>
        </Flex>
      </Flex>

      <View className="bg-gray-50 p-6 rounded-lg space-y-6">
        <RadioGroupField
          name="suggested-titles"
          legend="Suggested Titles"
          value={selectedTitle}
          onChange={(e) => setSelectedTitle(e.target.value)}
          className="space-y-3"
        >
          {keyword?.genSuggestedTitles?.map((title, index) => (
            <Radio key={index} value={title ?? ""} className="mb-2">
              {title}
            </Radio>
          ))}
          <Radio value="custom" className="mb-2">
            Write your own title
          </Radio>
        </RadioGroupField>

        {selectedTitle === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="custom-title">Custom Title</Label>
            <Input
              id="custom-title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="bg-white text-black"
              placeholder="Enter your custom title"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="additional-instructions">
            Additional Instructions
          </Label>
          <Textarea
            id="additional-instructions"
            className="bg-white text-black"
            placeholder="Enter additional instructions"
            rows={4}
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
          />
        </div>

        <Button
          variation="primary"
          onClick={handleApprove}
          isDisabled={
            !selectedTitle || (selectedTitle === "custom" && !customTitle)
          }
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Title
        </Button>

        {keyword?.approvedTitle && (
          <View className="bg-green-50 p-4 rounded-lg">
            <Heading level={4} className="text-xl font-semibold mb-2">
              Selected Title
            </Heading>
            <Text className="text-gray-700">{keyword.approvedTitle}</Text>
          </View>
        )}
      </View>
    </Card>
  );
};

export default PreOutlineComponent;
