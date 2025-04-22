"use client";

import {
  Button,
  ButtonGroup,
  Collection,
  Flex,
  Heading,
  Loader,
  Text,
  View,
} from "@aws-amplify/ui-react";
import React, { useEffect, useState } from "react";

import { ChevronRightIcon } from "lucide-react";
import { Schema } from "amplify/data/resource";
import { toast } from "sonner";
import { useClient } from "contexts/ClientContext";
import { useRouter } from "next/navigation";

type OutLineTemplatePrompt = Schema["OutLineTemplatePrompt"]["type"];

const OutlinePromptTemplate: React.FC = () => {
  const client = useClient();
  const router = useRouter();
  const [outlinePromptTemplates, setOutlinePromptTemplates] = useState<
    OutLineTemplatePrompt[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data: templates, errors } =
          await client.models.OutLineTemplatePrompt.list();
        if (errors) {
          console.error("Error fetching templates:", errors);
          return;
        }
        setOutlinePromptTemplates(templates);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    const sub = client.models.OutLineTemplatePrompt.observeQuery().subscribe({
      next: ({ items, isSynced }) => {
        setOutlinePromptTemplates([...items]);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  const createTemplate = async () => {
    const { data: template, errors } =
      await client.models.OutLineTemplatePrompt.create({
        outlineTemplate: "New Template",
        artifactName: "New Artifact",
      });

    if (errors) {
      console.error("Error creating template:", errors);
      return;
    }

    toast.success("Template created successfully!");
    // navigateToTemplate(template.id);
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await client.models.OutLineTemplatePrompt.delete({
        id: templateId,
      });

      toast.success("Template deleted successfully!");
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const navigateToTemplate = (templateId: string) => {
    router.push(`/admin/outline-template-prompts/${templateId}`);
  };

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Loader size="large" />
      </Flex>
    );
  }

  return (
    <View className="container mx-auto px-4 py-8">
      <Heading level={1} className="text-3xl font-bold text-gray-800 mb-6">
        Outline Prompt Templates
      </Heading>
      <Button onClick={createTemplate}>Create New Template</Button>
      <Collection items={outlinePromptTemplates} type="list" gap="1rem">
        {(template) => (
          <View
            key={template.id}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
          >
            <Flex justifyContent="space-between" alignItems="center">
              <Text className="text-lg text-gray-700">
                {template?.outlineTemplate || "Unnamed Template"}
              </Text>
              <ButtonGroup size="small">
                <Button onClick={() => navigateToTemplate(template.id)}>
                  <span>Edit</span>
                  <ChevronRightIcon className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => deleteTemplate(template.id)}
                  colorTheme="error"
                >
                  <span>Delete</span>
                  <ChevronRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </ButtonGroup>
            </Flex>
          </View>
        )}
      </Collection>
    </View>
  );
};

export default OutlinePromptTemplate;
