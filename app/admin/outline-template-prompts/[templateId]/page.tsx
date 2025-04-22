"use client";

import {
  AlertCircleIcon,
  ArrowLeftIcon,
  EditIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import {
  Button,
  Card,
  Divider,
  Flex,
  Heading,
  Loader,
  Text,
  TextAreaField,
  TextField,
  View,
} from "@aws-amplify/ui-react";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Schema } from "amplify/data/resource";
import { useClient } from "contexts/ClientContext";

type OutLineTemplatePrompt = Schema["OutLineTemplatePrompt"]["type"];
type SectionTemplatePrompt = Schema["SectionTemplatePrompt"]["type"];

const OutlineTemplateDetail: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const templateId = params?.templateId as string;
  const client = useClient();
  const [template, setTemplate] = useState<OutLineTemplatePrompt | null>(null);
  const [editedTemplate, setEditedTemplate] = useState<
    Partial<OutLineTemplatePrompt>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMainSectionCollapsed, setIsMainSectionCollapsed] = useState(false);

  const [sectionTemplates, setSectionTemplates] = useState<
    SectionTemplatePrompt[]
  >([]);
  const [editingSectionTemplate, setEditingSectionTemplate] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data, errors } = await client.models.OutLineTemplatePrompt.get({
          id: templateId,
        });

        if (errors) {
          console.error("API Errors:", errors);
          throw new Error(errors.join(", "));
        }

        if (!data) {
          throw new Error("Template not found");
        }

        console.log("Template:", data);

        setTemplate(data);
        setEditedTemplate(data);

        const { data: sectionTemplates, errors: sectionTemplateErrors } =
          await data.sectionTemplatePrompts();
        if (sectionTemplateErrors) {
          console.error("API Errors:", sectionTemplateErrors);
          throw new Error(sectionTemplateErrors.join(", "));
        }
        if (!sectionTemplates) {
          throw new Error("Section templates not found");
        }
        console.log("Section Templates:", sectionTemplates);
        setSectionTemplates(sectionTemplates);
      } catch (err: unknown) {
        console.error("Fetch Error:", err);
        if (err instanceof Error) {
          setError(`Failed to fetch template: ${err.message}`);
        } else {
          setError("An unknown error occurred while fetching the template.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, client.models.OutLineTemplatePrompt]);

  const navigateBack = () => {
    router.push("/admin/outline-template-prompts");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTemplate(template || {});
  };

  const handleInputChange = (
    field: keyof OutLineTemplatePrompt,
    value: string
  ) => {
    setEditedTemplate((prev) => ({ ...prev, [field]: value }));
  };
  const handleEditSectionTemplate = (sectionTemplateId: string) => {
    setEditingSectionTemplate(sectionTemplateId);
  };

  const handleCancelEditSectionTemplate = () => {
    setEditingSectionTemplate(null);
  };

  const handleSaveSectionTemplate = async (
    sectionTemplate: SectionTemplatePrompt
  ) => {
    try {
      const { data, errors } = await client.models.SectionTemplatePrompt.update(
        {
          id: sectionTemplate.id,
          sectionTemplate: sectionTemplate.sectionTemplate,
          prompt: sectionTemplate.prompt,
        }
      );

      if (errors) {
        console.error("API Errors:", errors);
        throw new Error(errors.join(", "));
      }

      if (data) {
        setSectionTemplates(
          sectionTemplates.map((st) => (st.id === data.id ? data : st))
        );
        setEditingSectionTemplate(null);
      }
    } catch (err) {
      console.error("Error updating section template:", err);
      setError("Failed to update section template");
    }
  };

  const handleSectionTemplateInputChange = (
    id: string,
    field: keyof SectionTemplatePrompt,
    value: string
  ) => {
    setSectionTemplates(
      sectionTemplates.map((st) =>
        st.id === id ? { ...st, [field]: value } : st
      )
    );
  };

  const handleCreateNewTemplate = async () => {
    try {
      const { data: sectionTemplate, errors } =
        await client.models.SectionTemplatePrompt.create({
          sectionTemplate: "New Section Template",
          prompt: "Enter prompt here",
          outLineTemplatePromptId: templateId,
        });

      if (errors) {
        console.error("API Errors:", errors);
        throw new Error(errors.join(", "));
      }

      if (sectionTemplate) {
        setSectionTemplates([...sectionTemplates, sectionTemplate]);
      }
    } catch (err) {
      console.error("Error creating new section template:", err);
      setError("Failed to create new section template");
    }
  };

  const handleDeleteSectionTemplate = async (sectionTemplateId: string) => {
    try {
      const { errors } = await client.models.SectionTemplatePrompt.delete({
        id: sectionTemplateId,
      });

      if (errors) {
        console.error("API Errors:", errors);
        throw new Error(errors.join(", "));
      }

      setSectionTemplates(
        sectionTemplates.filter((st) => st.id !== sectionTemplateId)
      );
    } catch (err) {
      console.error("Error deleting section template:", err);
      setError("Failed to delete section template");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const { data, errors } = await client.models.OutLineTemplatePrompt.update(
        {
          id: templateId,
          ...editedTemplate,
        }
      );

      if (errors) {
        console.error("API Errors:", errors);
        throw new Error(errors.join(", "));
      }

      if (!data) {
        throw new Error("Failed to update template");
      }

      setTemplate(data);
      setIsEditing(false);
    } catch (err: unknown) {
      console.error("Save Error:", err);
      if (err instanceof Error) {
        setError(`Failed to save template: ${err.message}`);
      } else {
        setError("An unknown error occurred while saving the template.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderSectionTemplates = () => (
    <Card variation="elevated" className="mt-8">
      <Flex justifyContent="space-between" alignItems="center" className="mb-4">
        <Heading level={2} className="text-2xl font-bold text-gray-800">
          Section Templates
        </Heading>
        <Button
          onClick={handleCreateNewTemplate}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded inline-flex items-center transition duration-300 ease-in-out"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          <span>Create New Section Template</span>
        </Button>
      </Flex>
      {sectionTemplates.map((sectionTemplate) => (
        <Card key={sectionTemplate.id} className="mb-4">
          <Flex justifyContent="space-between" alignItems="center">
            {editingSectionTemplate === sectionTemplate.id ? (
              <TextField
                value={sectionTemplate?.sectionTemplate || ""}
                label="Section Template"
                onChange={(e) =>
                  handleSectionTemplateInputChange(
                    sectionTemplate.id,
                    "sectionTemplate",
                    e.target.value
                  )
                }
                className="w-full"
              />
            ) : (
              <Text className="font-semibold">
                {sectionTemplate.sectionTemplate}
              </Text>
            )}
            <Flex gap="1rem">
              {editingSectionTemplate === sectionTemplate.id ? (
                <>
                  <Button
                    onClick={() => handleSaveSectionTemplate(sectionTemplate)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <SaveIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleCancelEditSectionTemplate}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleEditSectionTemplate(sectionTemplate.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <EditIcon className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={() => handleDeleteSectionTemplate(sectionTemplate.id)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </Flex>
          </Flex>
          {editingSectionTemplate === sectionTemplate.id ? (
            <TextAreaField
              value={sectionTemplate?.prompt || ""}
              label="Prompt"
              onChange={(e) =>
                handleSectionTemplateInputChange(
                  sectionTemplate.id,
                  "prompt",
                  e.target.value
                )
              }
              className="w-full mt-2"
            />
          ) : (
            <Text className="mt-2">{sectionTemplate.prompt}</Text>
          )}
        </Card>
      ))}
    </Card>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <Flex justifyContent="center" alignItems="center" height="50vh">
          <Loader size="large" />
        </Flex>
      );
    }

    if (error) {
      return (
        <Card variation="elevated">
          <Flex alignItems="center" gap="1rem">
            <AlertCircleIcon className="text-red-500" />
            <Text color="red" fontSize="large">
              {error}
            </Text>
          </Flex>
        </Card>
      );
    }

    if (!template) {
      return (
        <Card variation="elevated">
          <Text>Template not found.</Text>
        </Card>
      );
    }

    return (
      <>
        <Card variation="elevated">
          <Flex
            justifyContent="space-between"
            alignItems="center"
            className="mb-6"
          >
            <Heading level={1} className="text-3xl font-bold text-gray-800">
              {template.outlineTemplate}
            </Heading>
            {!isEditing ? (
              <Button onClick={handleEdit}>
                <EditIcon className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <Flex gap="1rem">
                <Button onClick={handleSave} isLoading={isSaving}>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </Flex>
            )}
          </Flex>

          <View className="space-y-4">
            <DetailItem
              label="Outline Template"
              value={editedTemplate.outlineTemplate || ""}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("outlineTemplate", value)}
            />
            <DetailItem
              label="Artifact Name"
              value={editedTemplate.artifactName || ""}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("artifactName", value)}
            />
            <DetailItem
              label="SME"
              value={editedTemplate.sme || ""}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("sme", value)}
              multiline
            />
            <DetailItem
              label="Title Persona"
              value={editedTemplate.titlePersona || ""}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("titlePersona", value)}
              multiline
            />
            <DetailItem
              label="Related Keywords"
              value={editedTemplate.relatedKeywords || ""}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("relatedKeywords", value)}
            />
            <DetailItem
              label="Outline"
              value={editedTemplate.outline || ""}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("outline", value)}
              multiline
            />
            <DetailItem
              label="Outline JSON"
              value={editedTemplate.outlineJson || ""}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("outlineJson", value)}
              multiline
              isCode
            />
            <DetailItem
              label="Outline Markdown"
              value={editedTemplate.outlineMarkdown || ""}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("outlineMarkdown", value)}
              multiline
            />
            <DetailItem
              label="Outline JSON Decode Instructions"
              value={editedTemplate.outlineJsonDecodeInstructions || ""}
              isEditing={isEditing}
              onChange={(value) =>
                handleInputChange("outlineJsonDecodeInstructions", value)
              }
              multiline
            />
            <DetailItem
              label="Outline JSON Decode JSON"
              value={editedTemplate.outlineJsonDecodeJson || ""}
              isEditing={isEditing}
              onChange={(value) =>
                handleInputChange("outlineJsonDecodeJson", value)
              }
              multiline
              isCode
            />
            <DetailItem
              label="Additional Tone Instructions"
              value={editedTemplate.additionalToneInstructions || ""}
              isEditing={isEditing}
              onChange={(value) =>
                handleInputChange("additionalToneInstructions", value)
              }
              multiline
            />
          </View>
        </Card>
        {renderSectionTemplates()}
      </>
    );
  };

  return (
    <View className="container mx-auto px-4 py-8">
      <Flex justifyContent="space-between" alignItems="center" className="mb-6">
        <Button
          onClick={navigateBack}
          isDisabled={isLoading || isSaving}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center transition duration-300 ease-in-out"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          <span>Back to Templates</span>
        </Button>
      </Flex>

      {renderContent()}
    </View>
  );
};

interface DetailItemProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  isCode?: boolean;
  multiline?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({
  label,
  value,
  isEditing,
  onChange,
  isCode = false,
  multiline = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View>
      <Button
        onClick={toggleAccordion}
        className="w-full text-left py-2 px-4 bg-gray-100 hover:bg-gray-200 transition duration-300 ease-in-out"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Text className="font-semibold text-gray-700">{label}</Text>
          <Text>{isExpanded ? "▲" : "▼"}</Text>
        </Flex>
      </Button>
      {isExpanded && (
        <View className="p-4 border-t border-gray-200">
          {isEditing ? (
            multiline ? (
              <TextAreaField
                value={value}
                label={label}
                onChange={(e) => onChange(e.target.value)}
                className="w-full"
              />
            ) : (
              <TextField
                value={value}
                label={label}
                onChange={(e) => onChange(e.target.value)}
                className="w-full"
              />
            )
          ) : isCode ? (
            <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
              <code className="text-sm text-gray-800">{value || "-"}</code>
            </pre>
          ) : (
            <Text className="text-gray-600 whitespace-pre-wrap">
              {value || "-"}
            </Text>
          )}
        </View>
      )}
      <Divider className="mt-4" />
    </View>
  );
};

export default OutlineTemplateDetail;
