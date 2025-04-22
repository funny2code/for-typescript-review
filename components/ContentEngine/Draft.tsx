"use client";

import {
  Button,
  ButtonGroup,
  Card,
  Flex,
  Heading,
  Text,
  View,
} from "@aws-amplify/ui-react";
import { ClipboardIcon, TrashIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

import { Schema } from "amplify/data/resource";
import { useClient } from "contexts/ClientContext";
import { useRouter } from "next/navigation";

type Keyword = Schema["Keyword"]["type"];
type Product = Schema["Product"]["type"];
type Company = Schema["Company"]["type"];
type Draft = Schema["Draft"]["type"];
type Section = Schema["Section"]["type"] & {
  draftId: string;
  type: string;
  template: string;
  title: string;
  order: number;
  keyword: string;
  keyTakeaways: string;
  summaryOnSite: string;
  summaryOffSite: string;
  writtenContent: string;
  finalMarkdownContent: string;
  content: string;
  status: string;
};

interface DraftComponentProps {
  keyword: Keyword;
  company: Company;
  product: Product;
  draft: Draft;
  generateSection: (sectionId: string) => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
}

const DraftComponent: React.FC<DraftComponentProps> = ({
  keyword,
  company,
  product,
  draft,
  generateSection,
  deleteDraft,
}) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const dataClient = useClient();
  const router = useRouter();

  useEffect(() => {
    const fetchDraftSections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: currentDraft, errors: getCurrentDraft } =
          await dataClient.models.Draft.get({
            id: draft.id,
          });
        if (getCurrentDraft) {
          setError("Error fetching draft");
          setIsLoading(false);
          return;
        }
        if (getCurrentDraft) {
          throw new Error("Error fetching draft");
        }
        if (!currentDraft) {
          throw new Error("No draft found");
        }

        const datasections = await currentDraft.sections();
        if (!datasections || !datasections.data) {
          throw new Error("No draft sections found");
        }

        const sortedSections = [...datasections.data].sort((a, b) => {
          const orderA = a.order ?? 0;
          const orderB = b.order ?? 0;
          return orderA - orderB;
        });
        setSections(sortedSections as Section[]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDraftSections();
  }, [draft.id, dataClient.models.Draft]);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "not started":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (isLoading) {
    return (
      <View className="flex items-center justify-center h-screen">
        <Text className="text-xl font-semibold text-gray-600">
          Loading draft...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex items-center justify-center h-screen">
        <Text className="text-xl font-semibold text-red-600">
          Error: {error}
        </Text>
      </View>
    );
  }

  return (
    <Card className=" mx-auto p-8 bg-white shadow-xl rounded-lg">
      <Flex direction="column" gap="2rem">
        <Flex
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          // alignContent="space-around"
        >
          <Flex gap="1rem">
            <Heading level={5} className="text-xl font-bold text-gray-800">
              {draft.title}
            </Heading>
          </Flex>
          <Flex gap="1rem">
            <ButtonGroup size="small">
              <Button
                onClick={() => {
                  /* Implement copy functionality */
                  router.push(
                    `/companies/content-engine/product/keyword/${keyword.id}/draft/${draft.id}`
                  );
                }}
                className="flex items-center"
              >
                <ClipboardIcon className="h-5 w-5 mr-2" />
                View
              </Button>

              <Button
                variation="destructive"
                onClick={() => {
                  deleteDraft(draft.id);
                }}
                className="flex items-center"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Delete
              </Button>
            </ButtonGroup>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default DraftComponent;
