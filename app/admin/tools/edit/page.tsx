"use client";

import * as mutations from "graphql/mutations";

import { Button, Flex, Link } from "@aws-amplify/ui-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Tool, ToolStatus } from "@/types/admin";

import { Fragment } from "react";
import { PageHeading } from "@components/ui/PageHeading";
import ToolForm from "@components/shared/ToolForm";
import { systemVariables } from "constants/admin";
import { useClient } from "contexts/ClientContext";
import { useRouter } from "next/navigation";
import { useUserGroups } from "contexts/UserGroupsContext";
import { ICompanyState, ITag } from "interfaces";
import { useSelector } from "react-redux";
import { selectCompanyState } from "@redux/reducers/companyReducer";

const EditToolPage = () => {
  const router = useRouter();
  const client = useClient();
  
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { editToolByAdmin } = companyState;
  const toolId = editToolByAdmin?.id;

  useEffect(() => {
    if (!toolId || !editToolByAdmin) router.back();
  }, [])
  
  const [tool, setTool] = useState<Tool>();
  const [toolName, setToolName] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [toolDescription, setToolDescription] = useState<string>("");
  const [toolImageURL, settoolImageURL] = useState<string>("");
  const [toolInstruction, setToolInstruction] = useState<string>("");
  const { isSuperAdmin } = useUserGroups();
  const [updateText, setUpdateText] = useState("Update");
  const [publishText, setPublishText] = useState("Publish");
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [isPublishLoading, setPublishLoading] = useState(false);
  const [toolTag, setToolTag] = useState<string>("");
  const [tags, setTags] = useState<ITag[]>([]);
  const [selectedTags, setSelectedTags] = useState<ITag[]>([]);
  // const [originalToolTags, setOriginalToolTags] = useState<{id: string; tagId: string}[]>([]);
  const [toolEndUserInstructions, setToolEndUserInstructions] =
    useState<string>("");
  const [toolAdditionalInstructions, setToolAdditionalInstructions] =
    useState<string>("");
  const [toolInputs, setToolInputs] = useState([
    {
      name: "input1",
      label: "Input 1",
      description: "Description for Input 1",
      value: "",
      type: "text",
    },
  ]);

  const [files, setFiles] = useState<{ [key: string]: { fileName: string } }>({});

  const [toolUserMessage, setToolUserMessage] = useState<string>("");

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
    movetolist();
  }

  function openModal() {
    setIsOpen(true);
  }
  const cancelClickHandler = () => {
    router.push(`/admin/tools`);
  };

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
  const safeSelectedFunctions = selectedFunctions || [];

  const updateToolClickHandler = async () => {
    setUpdateText("Updating...");
    const inputs = toolInputs.map((input) => {
      return {
        inputFieldName: input.name,
        inputFieldLabel: input.label,
        inputFieldType: input.type ?? "text",
        inputFieldDescription: input.description,
        inputFieldPlaceholder: input.label,
        inputFieldRequired: false,
        inputFieldOptions: [],
      };
    });

    const jsonInputs = JSON.stringify(inputs);

    const variables = {
      id: toolId as string,
      name: toolName,
      instructions: toolInstruction,
      toolAdditionalInstructions: toolAdditionalInstructions,
      userMessage: toolUserMessage,
      inputs: jsonInputs,
      toolFunctions: JSON.stringify(selectedFunctions),
      toolDescription: toolDescription,
      toolImageURL: toolImageURL,
      toolEndUserMessage: toolEndUserInstructions,
      toolTag: toolTag,
    };

    const updateTool = await client.models.Tool.update(variables);

    // update the tooltag
    const selectedTagIds = selectedTags.map(tag => tag.id);
    const { data: updatedTool, errors } = await client.models.Tool.get({id: toolId!});
    const originalToolTags = (await updatedTool?.tags() || {data: []}).data.map(item => ({id: item.id, tagId: item.tagId}));
    originalToolTags.forEach(async (toolTag) => {
      if (selectedTagIds.indexOf(toolTag.tagId) == -1) {
        await client.models.ToolTag.delete({id: toolTag.id});
      }
    });
    const originalTagIds = originalToolTags.map(item => item.tagId);
    const newAddedTags = selectedTags.filter(tag => (originalTagIds.indexOf(tag.id) == -1));

    const updatedTags = newAddedTags.forEach(async (tag) => {
      await client.models.ToolTag.create({
        toolId: toolId!,
        tagId: tag.id,
      });
    });

    if (updateTool) {
      try {
        // const response = await client.graphql({
        //   query: mutations.updateToolHandler,
        //   variables: {
        //     toolId: toolId as string,
        //   },
        // });
        setUpdateText("Updated!");
        // openModal();
      } catch (error) {
        setUpdateText("Update Failed!");
        // console.log(error);
      }
    }
    // setUpdateText("Update");
  };

  const publishToolClickHandler = async () => {
    setPublishText("Updating...");
    setPublishLoading(true);
    const inputs = toolInputs.map((input) => {
      return {
        inputFieldName: input.name,
        inputFieldLabel: input.label,
        inputFieldType: input.type ?? "text",
        inputFieldDescription: input.description,
        inputFieldPlaceholder: input.label,
        inputFieldRequired: false,
        inputFieldOptions: [],
      };
    });

    const jsonInputs = JSON.stringify(inputs);

    let imageUrl;

    if (Object.keys(files).length === 0) {
      imageUrl = toolImageURL;
    } else {
      const firstKey = Object.keys(files)[0];
      imageUrl = files[firstKey].fileName;
    }

    const variables = {
      id: toolId as string,
      name: toolName,
      instructions: toolInstruction,
      toolAdditionalInstructions: toolAdditionalInstructions,
      userMessage: toolUserMessage,
      inputs: jsonInputs,
      toolFunctions: JSON.stringify(selectedFunctions),
      toolDescription: toolDescription,
      toolImageURL: imageUrl,
      toolEndUserMessage: toolEndUserInstructions,
      toolTag: toolTag,
    };

    // console.log("variables", variables);
    // console.log("isActive", isActive);

    let status: ToolStatus;

    switch (tool?.status) {
      case "DRAFT":
        status = "DRAFT";
        break;
      case "PENDING":
        status = "PENDING";
        break;
      case "ACTIVE":
        status = isActive ? "ACTIVE" : "INACTIVE";
        break;
      default:
        status = "PENDING";
    }

    const updateTool = await client.models.Tool.update({
      ...variables,
      status: status,
    });

    // update the tooltag
    const selectedTagIds = selectedTags.map(tag => tag.id);
    const { data: updatedTool, errors } = await client.models.Tool.get({id: toolId!});
    const originalToolTags = (await updatedTool?.tags() || {data: []}).data.map(item => ({id: item.id, tagId: item.tagId}));
    originalToolTags.forEach(async (toolTag) => {
      if (selectedTagIds.indexOf(toolTag.tagId) == -1) {
        await client.models.ToolTag.delete({id: toolTag.id});
      }
    });
    const originalTagIds = originalToolTags.map(item => item.tagId);
    const newAddedTags = selectedTags.filter(tag => (originalTagIds.indexOf(tag.id) == -1));

    const updatedTags = newAddedTags.forEach(async (tag) => {
      await client.models.ToolTag.create({
        toolId: toolId!,
        tagId: tag.id,
      });
    });

    // console.log("updateTool", updateTool);
    if (updateTool) {
      try {
        const response = await client.graphql({
          query: mutations.updateToolHandler,
          variables: {
            toolId: toolId as string,
          },
        });
        setPublishText("Updated!");
        setPublishLoading(false);
        movetolist();
        // openModal();
      } catch (error) {
        setPublishText("Update Failed!");
        // console.log(error);
      }
    }
  };

  const extractVariables = (inputText: string) => {
    const regex = /{{\s*(\w+)\s*}}/g;
    let match;
    let extractedVariables = [];

    while ((match = regex.exec(inputText)) !== null) {
      extractedVariables.push(match[1]);
    }

    setToolInputs(
      extractedVariables.map((variable) => ({
        name: variable,
        label: variable, // Initialize label
        description: variable, // Initialize description
        value: "",
        type: "text",
      }))
    );

    const inputs = extractedVariables.map((variable) => {
      return {
        inputFieldName: variable,
        inputFieldType: "text",
        inputFieldDescription: variable,
        inputFieldPlaceholder: variable,
        inputFieldRequired: false,
        inputFieldOptions: [],
      };
    });
  };

  const movetolist = () => {
    router.push(`/admin/tools`);
  };

  const handleSelectVariables = (option: any) => {
    setToolUserMessage((prev) => prev + `{{${option.label}}}`);
  };

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

  const convertInputFormat = (input: any) => {
    return {
      name: input.inputFieldName,
      label: input.inputFieldLabel,
      description: input.inputFieldDescription,
      value: "",
      type: input.inputFieldType,
    };
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: tool, errors } = await client.models.Tool.get({
          id: toolId as string,
        });
        const { data: allTags, errors: tagErrors } = await client.models.Tag.list();

        if (errors || tagErrors) {
          return;
        }

        if (!tool) {
          return;
        }
        
        setTool(tool);
        setToolName(tool.name || "");
        setToolDescription(tool.toolDescription || "");
        settoolImageURL(tool.toolImageURL || "");
        setToolAdditionalInstructions(tool.toolAdditionalInstructions || "");
        setToolEndUserInstructions(tool.toolEndUserMessage || "");
        setToolTag(tool.toolTag || "");

        const initialTags: ITag[] = allTags.map(tag => ({id: tag.id, tagName: tag.tagName?.toLocaleUpperCase() || ''}));
        setTags(initialTags);
        const selected_tagIds = (await tool.tags()).data.map(item => item.tagId);
        const currentTags = initialTags.filter(tag => selected_tagIds.indexOf(tag.id) != -1);
        setSelectedTags(currentTags);

        if (tool.status === "ACTIVE") {
          setIsActive(true);
        } else {
          setIsActive(false);
        }

        const inputdata = JSON.parse(String(tool.inputs));
        const convertedInputs = inputdata.map(convertInputFormat);
        setToolInputs(convertedInputs);
        setSelectedFunctions(
          JSON.parse(
            typeof tool.toolFunctions === "string" ? tool.toolFunctions : "[]"
          )
        );
        setToolInstruction(tool.instructions || "");
        setToolUserMessage(tool.userMessage || "");
      } catch (error) {
      }
    };

    fetchData();
  }, [toolId]);

  // useEffect(() => {
  //   extractVariables(toolUserMessage);
  // }, [toolUserMessage]);

  if (!tool) {
    return (
      <div>
        <PageHeading title="Loading..." />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div>
        <PageHeading title="No Access" />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl">
      <PageHeading title="Edit Tool" />
      <pre>Tool Id - {toolId}</pre>
      <pre>Assistant Id - {tool.assistantId}</pre>
      <Link href={`https://platform.openai.com/assistants/${tool.assistantId}`}>
        <span className="text-blue-500">View In Playground</span>
      </Link>
      <div className="mt-8">
        <ToolForm
          toolName={toolName}
          setToolName={setToolName}
          toolDescription={toolDescription}
          setToolDescription={setToolDescription}
          toolInstruction={toolInstruction}
          setToolInstruction={setToolInstruction}
          toolInputs={toolInputs}
          setToolInputs={setToolInputs}
          handleInputChange={handleInputChange}
          toolUserMessage={toolUserMessage}
          setToolUserMessage={setToolUserMessage}
          toolImageURL={toolImageURL}
          setToolImageURL={settoolImageURL}
          systemVariables={systemVariables}
          variant="editForm"
          toolEndUserInstructions={toolEndUserInstructions}
          setToolEndUserInstructions={setToolEndUserInstructions}
          toolAdditionalInstructions={toolAdditionalInstructions}
          setToolAdditionalInstructions={setToolAdditionalInstructions}
          selectedFunctions={safeSelectedFunctions}
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

        <div className="mt-4 mr-4">
          <Flex alignContent="flex-end" justifyContent="flex-end" gap="1rem">
            <Button
              variation="warning"
              size="small"
              onClick={() => cancelClickHandler()}
            >
              Cancel
            </Button>
            <Button
              variation="primary"
              // variation={updateText === "Updated!" ? "success" : "primary"}
              size="small"
              isLoading={updateText === "Updating..."}
              onClick={() => updateToolClickHandler()}
            >
              {updateText}
            </Button>
            <Button
              variation="primary"
              // variation={updateText === "Updated!" ? "success" : "primary"}
              size="small"
              isLoading={publishText === "Updating..."}
              onClick={() => publishToolClickHandler()}
            >
              {publishText}
            </Button>
          </Flex>
        </div>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Update Succesfull!
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Your Update is successful. Lets move to tools list.
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Ok!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default EditToolPage;
