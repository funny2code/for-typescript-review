"use client";

import { Button, Flex } from "@aws-amplify/ui-react";
import { ChangeEvent, useState } from "react";

import { PageHeading } from "@components/ui/PageHeading";
import ToolForm from "@components/shared/ToolForm";
import { systemVariables } from "constants/admin";
import { useClient } from "contexts/ClientContext";
import { useRouter } from "next/navigation";
import { useUserGroups } from "contexts/UserGroupsContext";
import { ITag } from "interfaces";

export type ToolInput = {
  name: string;
  label: string;
  description: string;
  value: string;
  type: string;
};

export type SetInputFunction = (
  index: number,
  field: string,
  value: string
) => void;

const NewToolPage = () => {
  const router = useRouter();
  const { isSuperAdmin } = useUserGroups();
  const client = useClient();
  const [publishLoading, setPublishLoading] = useState<boolean>(false);
  const [toolName, setToolName] = useState<string>("");
  const [toolImageURL, settoolImageURL] = useState<string>("");
  const [toolInstruction, setToolInstruction] = useState<string>("");
  const [toolUserMessage, setToolUserMessage] = useState<string>("");
  const [toolDescription, setToolDescription] = useState<string>("");
  const [toolTag, setToolTag] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [tags, setTags] = useState<ITag[]>([]);
  const [selectedTags, setSelectedTags] = useState<ITag[]>([]);

  const handleSelectVariables = (option: any) => {
    // console.log("option", option);
    setToolUserMessage((prev) => prev + `{{${option.label}}}`);
  };

  const [toolAdditionalInstructions, setToolAdditionalInstructions] =
    useState<string>("");
  const [toolAImodel, setToolAImodel] = useState<string>("");
  const [toolEndUserInstructions, setToolEndUserInstructions] =
    useState<string>("");
  const [files, setFiles] = useState<{ [key: string]: { fileName: string } }>(
    {}
  );

  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);

  const handleFunctionsSelectionChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedFunctions((prev) => [...prev, name]);
    } else {
      setSelectedFunctions((prev) => prev.filter((func) => func !== name));
    }
  };

  const [toolInputs, setToolInputs] = useState([
    {
      name: "input1",
      label: "Input 1",
      description: "Description for Input 1",
      value: "",
      type: "text",
    },
  ]);

  const handleInputChange = (
    inputName: string,
    newValue: string,
    field: string
  ) => {
    setToolInputs((prevInputs) =>
      prevInputs.map((input) =>
        input.name === inputName ? { ...input, [field]: newValue } : input
      )
    );
  };

  const publishNewtoolClickHandler = async () => {
    setPublishLoading(true);

    // Map Inputs required for Tool
    const inputs = toolInputs.map((input) => {
      return {
        inputFieldName: input.name,
        inputFieldLabel: input.label,
        inputFieldType: input.type,
        inputFieldDescription: input.description,
        inputFieldPlaceholder: input.name,
        inputFieldRequired: false,
        inputFieldOptions: [],
      };
    });

    // Convert Inputs to JSON
    const jsonInputs = JSON.stringify(inputs);

    // Get the file name from the image Uploader
    let fileName;
    if (Object.keys(files).length !== 0) {
      const firstKey = Object.keys(files)[0];
      fileName = files[firstKey].fileName;
    } else {
      fileName = "https://picsum.photos/800/600?random=12";
    }

    // Create Inital Tool Record
    const createReq = {};

    // Create Tool Record Using Client
    const { errors, data: tool } = await client.models.Tool.create(
      {
        name: toolName,
        instructions: toolInstruction,
        userMessage: toolUserMessage,
        inputs: jsonInputs,
        toolDescription: toolDescription,
        toolImageURL: fileName,
        toolEndUserMessage: toolEndUserInstructions,
        toolAdditionalInstructions: toolAdditionalInstructions,
        toolFunctions: JSON.stringify(selectedFunctions),
        toolTag: toolTag,
        status: "DRAFT",
      },
      {
        authMode: "userPool",
      }
    );

    if (errors) {
      // console.warn(errors);
      return;
    }

    if (!tool) {
      // console.warn("Tool not created");
      return;
    }

    // Create
    const variables = {
      toolId: tool.id,
    };

    try {
      const { data, errors } = await client.mutations.createToolHandler({
        toolId: tool.id,
      });
      // const response = await client.graphql({
      //   query: mutations.createToolHandler,
      //   variables: variables,
      // });
      // console.log("response", data);
      setPublishLoading(false);
      router.push(`/admin/tools`);
    } catch (error) {
      // console.log(error);
    }
  };
  // Add Dummy Data
  const addDummyDataClickHandler = () => {
    setToolName("Dummy Tool");
    settoolImageURL("https://picsum.photos/600/400?random=12");
    setToolInstruction("Return User prompt");
    setToolUserMessage(
      "Company Name : {{brandlens.companyName}} , name: {{name}}"
    );
    setToolDescription("This is a dummy tool description");
    setToolEndUserInstructions("This is a dummy end user instructions");
    setToolAdditionalInstructions("This is a dummy additional instructions");
    setToolTag("SEO");
    setToolInputs([
      {
        name: "input1",
        label: "Input 1",
        description: "Description for Input 1",
        value: "",
        type: "text",
      },
      {
        name: "input2",
        label: "Input 2",
        description: "Description for Input 2",
        value: "",
        type: "text",
      },
    ]);
  };
  /// Create A Draft New Tool
  const createDraftNewToolClickHandler = async () => {
    const inputs = toolInputs.map((input) => {
      return {
        inputFieldName: input.name,
        inputFieldType: input.type,
        inputFieldDescription: input.name,
        inputFieldPlaceholder: input.name,
        inputFieldRequired: false,
        inputFieldOptions: [],
      };
    });

    const jsonInputs = JSON.stringify(inputs);

    const { errors, data: newTool } = await client.models.Tool.create({
      name: toolName,
      instructions: toolInstruction,
      status: "DRAFT",
      userMessage: toolUserMessage,
      inputs: jsonInputs,
    });
  };

  if (!isSuperAdmin) {
    return (
      <div>
        <PageHeading title="No Access" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-2xl p-6">
      <PageHeading title="Create New Tool" />
      <Button
        variation="primary"
        size="small"
        onClick={() => addDummyDataClickHandler()}
      >
        Add Dummy Data
      </Button>
      <div className="mt-8">
        <ToolForm
          variant="newForm"
          toolName={toolName}
          setToolName={setToolName}
          toolImageURL={toolImageURL}
          setToolImageURL={settoolImageURL}
          toolInstruction={toolInstruction}
          setToolInstruction={setToolInstruction}
          toolUserMessage={toolUserMessage}
          setToolUserMessage={setToolUserMessage}
          toolDescription={toolDescription}
          setToolDescription={setToolDescription}
          toolEndUserInstructions={toolEndUserInstructions}
          setToolEndUserInstructions={setToolEndUserInstructions}
          toolAdditionalInstructions={toolAdditionalInstructions}
          setToolAdditionalInstructions={setToolAdditionalInstructions}
          toolInputs={toolInputs}
          setToolInputs={setToolInputs}
          handleInputChange={handleInputChange}
          systemVariables={systemVariables}
          selectedFunctions={selectedFunctions || []}
          handleFunctionsSelectionChange={handleFunctionsSelectionChange}
          files={files}
          setFiles={setFiles}
          isActive={isActive}
          setIsActive={setIsActive}
          handleSelectVariables={handleSelectVariables}
          toolTag={toolTag}
          setToolTag={setToolTag}
          tags={tags}
          setTags={setTags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />

        <div className="mt-14 mb-8 mr-5 text-right">
          <Flex alignContent="flex-end" justifyContent="flex-end" gap="1rem">
            <Button
              variation="warning"
              size="small"
              onClick={() => router.push("/admin/tools")}
            >
              Cancel
            </Button>

            <Button
              variation="warning"
              size="small"
              onClick={() => createDraftNewToolClickHandler()}
            >
              Save as Draft
            </Button>

            <Button
              variation="primary"
              size="small"
              isLoading={publishLoading}
              onClick={() => publishNewtoolClickHandler()}
              loadingText="Publishing"
            >
              Publish
            </Button>
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default NewToolPage;
