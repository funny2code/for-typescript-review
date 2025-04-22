import {
  Accordion,
  Autocomplete,
  CheckboxField,
  Divider,
  Fieldset,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField,
  ThemeProvider,
} from "@aws-amplify/ui-react";
import { StorageImage, StorageManager } from "@aws-amplify/ui-react-storage";
import React, { SetStateAction, useEffect } from "react";

import { ToolInput } from "app/admin/tools/new/page";
import { avaiableSystemVariables } from "constants/admin";
import { MultiSelect } from "@components/shadcn/ui/multiSelect";
import { useClient } from "contexts/ClientContext";
import { ITag } from "interfaces";

interface ToolFormProps {
  variant: string;
  toolName: string;
  setToolName: (value: string) => void;
  toolImageURL: string;
  setToolImageURL: (value: string) => void;
  toolInstruction: string;
  setToolInstruction: (value: string) => void;
  toolUserMessage: string;
  setToolUserMessage: (value: string) => void;
  toolDescription: string;
  setToolDescription: (value: string) => void;
  toolEndUserInstructions: string;
  setToolEndUserInstructions: (value: string) => void;
  toolInputs: ToolInput[]; // Replace `any` with the appropriate type
  setToolInputs: (value: ToolInput[]) => void;
  handleInputChange: (name: string, value: string, type: string) => void;
  toolAdditionalInstructions: string;
  setToolAdditionalInstructions: (value: string) => void;
  systemVariables: string[];
  selectedFunctions: string[];
  files: any;
  setFiles: (value: any) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  handleFunctionsSelectionChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleSelectVariables: (option: any) => void;
  toolTag: string;
  setToolTag: (value: string) => void;
  tags: ITag[];
  setTags: React.Dispatch<SetStateAction<ITag[]>>
  selectedTags: ITag[];
  setSelectedTags: React.Dispatch<SetStateAction<ITag[]>>;
}

const ToolForm: React.FC<ToolFormProps> = ({
  variant,
  toolName,
  setToolName,
  toolImageURL,
  setToolImageURL,
  toolInstruction,
  setToolInstruction,
  toolUserMessage,
  setToolUserMessage,
  toolDescription,
  setToolDescription,
  toolEndUserInstructions,
  setToolEndUserInstructions,
  toolInputs,
  setToolInputs,
  handleInputChange,
  toolAdditionalInstructions,
  setToolAdditionalInstructions,
  systemVariables,
  selectedFunctions,
  handleFunctionsSelectionChange,
  files,
  setFiles,
  isActive,
  setIsActive,
  handleSelectVariables,
  toolTag,
  setToolTag,
  tags,
  setTags,
  selectedTags,
  setSelectedTags,
}) => {
  // console.log("toolImageURL", toolImageURL);
  const client = useClient();

  const processFile = async ({ file }: { file: File }) => {
    const fileExtension = file.name.split(".").pop();

    return file
      .arrayBuffer()
      .then((filebuffer) => window.crypto.subtle.digest("SHA-1", filebuffer))
      .then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((a) => a.toString(16).padStart(2, "0"))
          .join("");
        return { file, key: `${hashHex}.${fileExtension}` };
      });
  };

  const extractVariables = (inputText1: string) => {
    const regex = /{{\s*([\s\S]+?)\s*}}/g; // Updated regex
    let match;
    let extractedVariables: string[] = [];

    while ((match = regex.exec(inputText1)) !== null) {
      extractedVariables.push(match[1]);
    }

    // console.log("extracted var == ", extractedVariables);

    //remove all duplicates

    extractedVariables = extractedVariables.filter(
      (item, index) => extractedVariables.indexOf(item) === index
    );
    const existingVariables = toolInputs.map(item => item.name);
    setToolInputs([
      ...extractedVariables.map(variable => {
        const index = existingVariables.indexOf(variable);
        return index == -1 ? {
          name: variable,
          label: variable, // Initialize label
          description: variable, // Initialize description
          value: "",
          type: variable.includes(".") ? "system" : "userInput",
        } : toolInputs[index];
      })
    ]);
  };

  const saveNewTag = async (newTag: ITag): Promise<ITag | null> => {
    const { data: tag, errors } = await client.models.Tag.create({
      tagName: newTag.tagName.toUpperCase()
    });
    if (tag) return {id: tag.id!, tagName: tag.tagName!};
    return null;
  }

  useEffect(() => {
    extractVariables(toolUserMessage);
  }, [toolUserMessage]);

  const theme = {
    name: "input-theme",
    tokens: {
      components: {
        autocomplete: {
          menu: {
            option: {
              _active: {
                backgroundColor: {
                  value: "#BD4C2A",
                },
              },
            },
          },
        },
        input: {
          label: {
            color: { value: "red" },
          },
          // color: { value: "#FDC94D" },
          backgroundColor: { value: "#BD4C2A" },
          borderColor: { value: "#BD4C2A" },
          borderRadius: { value: "{radii.medium}" },
          borderWidth: { value: "{borderWidths.thin}" },
          paddingX: { value: "{space.small}" },
          paddingY: { value: "{space.small}" },
          // _hover: {
          //   borderColor: { value: "{colors.blue.70}" },
          // },
          // _focus: {
          //   borderColor: { value: "{colors.blue.40}" },
          // },
        },
      },
    },
  };

  return (
    <div
      className="m-4 "
      style={{ display: "flex", flexDirection: "column", gap: "30px" }}
    >
      <ThemeProvider theme={theme}>
        <div className="flex-1 shadow-lg p-5 mt-5 border border-fomored-500 rounded">
          <h1 className="text-lg text-center text-fomored-500 font-dm font-bold underline">
            Tool Display Information
          </h1>
          <div className="p-4">
            <SwitchField
              isDisabled={false}
              label="Status : "
              labelPosition="start"
              isChecked={isActive}
              onChange={(e) => {
                setIsActive(e.target.checked);
              }}
            />
            <TextField
              style={{ backgroundColor: "#F9F9F9" }}
              variation="quiet"
              descriptiveText="Enter Tool Name"
              placeholder="Enter Tool Name"
              label="Tool Name"
              errorMessage="There is an error"
              name="toolName"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
            />
          </div>
          <div className="p-4">
            <TextAreaField
              style={{ backgroundColor: "#F9F9F9" }}
              descriptiveText="Enter Description shown on the card in the tool list page"
              label="Tool Description"
              name="description"
              placeholder="Enter Tool Description"
              rows={4}
              resize="vertical"
              value={toolDescription}
              onChange={(e) => setToolDescription(e.target.value)}
              variation="quiet"
            />
          </div>
          <div className="p-4">
            {variant === "editForm" && (
              <div>
                <h1 className="text-lg text-center text-fomored-500 font-dm font-bold underline">
                  Tool Image
                </h1>
                <StorageImage
                  alt={toolName}
                  imgKey={toolImageURL as string}
                  accessLevel="guest"
                  className="!object-fit !rounded !h-[162px] !w-full"
                  fallbackSrc="https://picsum.photos/800/600?random=12"
                />
              </div>
            )}
            <h1 className="text-lg text-center text-fomored-500 font-dm font-bold underline">
              Upload Tool Image
            </h1>
            <StorageManager
              acceptedFileTypes={["image/*"]}
              path="tools/"
              accessLevel="guest"
              maxFileCount={1}
              isResumable
              autoUpload={true}
              processFile={processFile}
              displayText={{
                // some text are plain strings
                // dropFilesText: "drag-and-drop Tool Image here",
                // browseFilesText: "Open file picker",
                // others are functions that take an argument
                getFilesUploadedText(count) {
                  return `${count} images uploaded`;
                },
              }}
              onUploadSuccess={({ key }) => {
                key &&
                  setFiles((prevFiles: any) => {
                    return {
                      ...prevFiles,
                      [key.toString()]: {
                        status: "success",
                        fileName: key,
                      },
                    };
                  });
              }}
            />
            <TextField
              className="!hidden"
              style={{ backgroundColor: "#F9F9F9" }}
              descriptiveText="Enter Tool Image URL"
              placeholder="Enter Tool Image URL"
              label="Tool Image URL"
              errorMessage="There is an error"
              name="toolImageURL"
              value={toolImageURL}
              onChange={(e) => setToolImageURL(e.target.value)}
              variation="quiet"
            />
          </div>
          <div className="p-4">
            <TextAreaField
              style={{ backgroundColor: "#F9F9F9" }}
              descriptiveText="Enter Instructions to be shown in the tool input page"
              label="Tool End User Instructions"
              name="userMessage"
              placeholder="Enter Tool End User Instructions"
              rows={3}
              resize="vertical"
              value={toolEndUserInstructions}
              onChange={(e) => setToolEndUserInstructions(e.target.value)}
              variation="quiet"
            />
          </div>
          {/* <div className="p-4">
            <TextAreaField
              style={{ backgroundColor: "#F9F9F9" }}
              descriptiveText="Enter Tool Tag"
              label="Tool Tag"
              name="toolTag"
              placeholder="Enter Tool Tag"
              rows={1}
              resize="vertical"
              value={toolTag}
              onChange={(e) => setToolTag(e.target.value)}
              variation="quiet"
            />
          </div> */}
          <div className="p-4">
            <label className="amplify-label">Tool Tags</label>
            <p data-testid="qa-field-description" className="amplify-text amplify-field__description py-2" id="amplify-id-:rb:">
              Select the tags - Max number is 4
            </p>
            <MultiSelect 
              items={tags}
              setItems={setTags}
              selectedItems={selectedTags}
              setSelectedItems={setSelectedTags}
              saveNewItem={saveNewTag}
            />
          </div>
        </div>
        <div className="flex-1 shadow-lg p-5 mt-5 border border-fomored-500 rounded">
          <h1 className="text-lg text-center text-fomored-500 font-dm font-bold underline">
            Tool AI Instructions
          </h1>
          <div className="p-4">
            <TextAreaField
              style={{ backgroundColor: "#F9F9F9" }}
              descriptiveText="Enter Instructions"
              label={variant ? "Tool Instructions" : "Instructions"}
              name="instructions"
              placeholder="Enter Instructions"
              rows={10}
              resize="vertical"
              value={toolInstruction}
              onChange={(e) => setToolInstruction(e.target.value)}
              variation="quiet"
            />
          </div>
          <div className="shadow p-5">
            <div className="flex">
              <div className="flex-auto">
                <div className="p-2 ">
                  <div className="p-2 text-right">
                    <h1 className="text-xs"></h1>
                    <div className="w-fit"></div>
                  </div>
                  <div className="mt-2">
                    <h1 className="text-lg">Tool Initiation Message</h1>

                    {/* <Tiptap
                      initialContent={toolUserMessage || ""}
                      setInitialContent={setToolUserMessage}
                    /> */}
                  </div>
                  {/* <div className="mt-5">
                    <h1 className="text-lg">Enter Additional Instructions</h1>

                    <Tiptap
                      initialContent={toolAdditionalInstructions || ""}
                      setInitialContent={setToolAdditionalInstructions}
                    />
                  </div> */}

                  <TextAreaField
                    style={{ backgroundColor: "#F9F9F9" }}
                    descriptiveText="Enter User Message"
                    label={`${variant ? "Tool Initation" : "User"} Message`}
                    name="userMessage"
                    placeholder={`Enter ${
                      variant ? "Initation" : "User"
                    } Message`}
                    rows={10}
                    resize="vertical"
                    value={toolUserMessage}
                    onChange={(e) => setToolUserMessage(e.target.value)}
                    variation="quiet"
                  />

                  <Autocomplete
                    label="Search system variables here"
                    options={avaiableSystemVariables}
                    placeholder="Search system variables here"
                    onSelect={(option) => {
                      handleSelectVariables(option);
                    }}
                  />

                  {/* <TextAreaField
                  descriptiveText="Enter Additional Instructions"
                  label={`${
                    variant ? "Tool Additonal Instructions" : "User"
                  } Message`}
                  name="userMessage"
                  placeholder={`Enter ${
                    variant ? "Additional Instructions" : "User"
                  } Message`}
                  rows={3}
                  resize="vertical"
                  value={toolAdditionalInstructions}
                  onChange={(e) =>
                    setToolAdditionalInstructions(e.target.value)
                  }
                /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 shadow-lg p-5 mt-5 border border-fomored-500 rounded">
          <div>
            {toolInputs.length > 0 && (
              <h1 className="text-lg text-center text-fomored-500 font-dm font-bold underline">
                Smart Tool Variable Information
              </h1>
            )}

            {/* {variant === "newForm" && (
            <div className="my-5 p-3  rounded-xl border ">
              <TextAreaField
                descriptiveText="Enter Tool End User Instructions"
                label="Tool End User Instructions"
                name="userMessage"
                placeholder="Enter Tool End User Instructions"
                rows={3}
                resize="vertical"
                value={toolEndUserInstructions}
                onChange={(e) => setToolEndUserInstructions(e.target.value)}
              />
            </div>
          )} */}

            {toolInputs.length === 0 && (
              <div className="p-4">
                <h1 className="text-lg text-center text-fomored-500 font-dm font-bold underline">
                  No Variables Detected
                </h1>
              </div>
            )}
            {toolInputs && (
              <div>
                {toolInputs.map((input: any, index: number) => (
                  <div
                    key={input.name}
                    className={`shadow rounded my-2 p-4 ${
                      input.type === "system" ? "bg-sunglow-100" : ""
                    }`}
                  >
                    <h5 className="text-sm">Input {input.type}</h5>
                    <h4 className="text-fomored-500 my-2">
                      Input Name : {input.name}
                    </h4>
                    {input.type === "userInput" && (
                      <div>
                        <div className="">
                          <TextField
                            descriptiveText="Enter Label of Input"
                            placeholder="Enter Label"
                            label="Input Label"
                            name="inputLabel"
                            style={{ backgroundColor: "#F9F9F9" }}
                            variation="quiet"
                            value={input.label}
                            /* onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const target = e.target as HTMLTextAreaElement;
                                handleInputUpdate(input.name, target.value, "label")
                              }
                            }} */
                            onChange={(e) => 
                              handleInputChange(
                                input.name,
                                e.target.value,
                                "label"
                              )
                            }
                          />
                        </div>
                        <div>
                          <TextAreaField
                            descriptiveText="Enter Description of Input"
                            placeholder="Enter Description"
                            label="Input Description"
                            name="inputDescription"
                            value={input.description}
                            /* onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const target = e.target as HTMLTextAreaElement;
                                handleInputUpdate(input.name, target.value, "description")
                              }
                            }} */
                            onChange={(e) =>
                              handleInputChange(
                                input.name,
                                e.target.value,
                                "description"
                              )
                            }
                          />
                        </div>
                      </div>
                    )}

                    {input.type === "system" && (
                      <div>
                        <CheckboxField
                          label="Show On UserInput Page"
                          name={input.name}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {variant && (
          <>
            {" "}
            <div className="py-3">
              <Divider orientation="horizontal" />
            </div>
            <Accordion.Container
              preventCollapse
              defaultValue={["advanced-settings"]}
            >
              <Accordion.Item value="advanced-settings">
                <Accordion.Trigger>
                  Advanced Settings
                  <Accordion.Icon />
                </Accordion.Trigger>
                <Accordion.Content>
                  <div className="flex justify-between">
                    <div className="m-4">
                      <Fieldset
                        legend="Add Core Functions"
                        variation="plain"
                        direction="column"
                      >
                        <CheckboxField
                          label="code_interpreter"
                          name="code_interpreter"
                          checked={
                            selectedFunctions.includes("code_interpreter") ||
                            false
                          }
                          onChange={handleFunctionsSelectionChange}
                        />
                        <CheckboxField
                          label="retrieval"
                          name="retrieval"
                          checked={
                            selectedFunctions.includes("retrieval") || false
                          }
                          onChange={handleFunctionsSelectionChange}
                        />
                        <CheckboxField
                          label="fomo_core"
                          name="fomo_core"
                          checked={
                            selectedFunctions.includes("retrieval") || false
                          }
                          onChange={handleFunctionsSelectionChange}
                        />
                      </Fieldset>
                    </div>
                    <div className="m-4">
                      <Fieldset
                        legend="Add Custom Functions"
                        variation="plain"
                        direction="column"
                      >
                        {/* <CheckboxField
                          label="WeatherTool"
                          name="WeatherTool"
                          checked={
                            selectedFunctions.includes("WeatherTool") || false
                          }
                          onChange={handleFunctionsSelectionChange}
                        /> */}
                        <CheckboxField
                          label="TavilySearchResults"
                          name="TavilySearchResults"
                          checked={
                            selectedFunctions.includes("TavilySearchResults") ||
                            false
                          }
                          onChange={handleFunctionsSelectionChange}
                        />
                      </Fieldset>
                    </div>
                    <div className="m-4">
                      <Fieldset
                        legend="Tool Settings"
                        variation="plain"
                        direction="column"
                      >
                        <CheckboxField
                          label="Hide User Message"
                          name="hide_user_message"
                        />
                        <CheckboxField
                          label="Service Client Tool"
                          name="service_client_tool"
                        />
                      </Fieldset>
                    </div>
                    <div className="m-4">
                      <Fieldset
                        legend="Model Settings"
                        variation="plain"
                        direction="column"
                      >
                        <SelectField label="Model Selection">
                          <option value="gpt-4-1106-preview">
                            gpt-4-turbo (default)
                          </option>
                          <option value="gpt-4" disabled>
                            gpt-4
                          </option>
                          <option value="gpt-3.5-turbo-16k" disabled>
                            gpt-3.5-turbo-16k
                          </option>
                        </SelectField>
                      </Fieldset>
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Container>
          </>
        )}
      </ThemeProvider>
    </div>
  );
};

export default ToolForm;
