"use client";

import {
  Button,
  ButtonGroup,
  DropZone,
  Flex,
  ScrollView,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Text,
  VisuallyHidden,
} from "@aws-amplify/ui-react";
import { useRef, useState } from "react";

import { PageHeading } from "@components/ui/PageHeading";
import Papa from "papaparse";
import { TextArea } from "react-aria-components";
import { toast } from "sonner";
import { useClient } from "contexts/ClientContext";
import { useRouter } from "next/navigation";
import { useUserGroups } from "contexts/UserGroupsContext";

type ParsedDataType = Record<string, string>[];

const NewToolPage: React.FC = () => {
  const router = useRouter();
  const { isSuperAdmin } = useUserGroups();
  const client = useClient();
  const acceptedFileTypes = ["text/csv"];
  const [files, setFiles] = useState<File[]>([]);
  const [data, setData] = useState<ParsedDataType>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const hiddenInput = useRef<HTMLInputElement>(null);

  const onFilePickerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) {
      return;
    }
    setFiles(Array.from(files));
  };

  const uploadBulkToolsClickHandler = () => {
    if (files.length === 0) {
      return;
    }

    const file = files[0];
    Papa.parse(file, {
      complete: (results) => {
        const parsedData = results.data as ParsedDataType;
        setData(parsedData);
        if (parsedData.length > 0) {
          setTableHeaders(Object.keys(parsedData[0]));
        }
      },
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });
  };

  const extractVariables = (inputText1: string) => {
    const regex = /{{\s*([\s\S]+?)\s*}}/g; // Updated regex
    let match;
    let extractedVariables: string[] = [];

    while ((match = regex.exec(inputText1)) !== null) {
      extractedVariables.push(match[1]);
    }

    // console.log("extracted var", extractedVariables);

    //remove all duplicates

    extractedVariables = extractedVariables.filter(
      (item, index) => extractedVariables.indexOf(item) === index
    );

    return extractedVariables;

    //   extractedVariables.map((variable) => ({
    //     name: variable,
    //     label: variable, // Initialize label
    //     description: variable, // Initialize description
    //     value: "",
    //     type: variable.includes(".") ? "system" : "userInput",
    //   }))
    // );
  };

  const formatValue = (value: string, header: string) => {
    // Customize formatting based on header or value type
    // Example: format dates or numbers, handle empty values, etc.
    // if (value.trim() === "") {
    //   return "N/A"; // Example for handling empty strings
    // }
    switch (header) {
      // Customize formatting based on header or value type
      // Example: format dates or numbers, handle empty values, etc.
      case "inputs":
        return ""; // Example for formatting dates
      // case "number":
      //   return formatNumber(value); // Example for formatting numbers
      // case "empty":
      //   return "N/A"; // Example for handling empty values
      default:
        return value; // Default formatting
    }
    return value; // Default formatting
  };

  const handleCreateToolsClick = async (data: ParsedDataType) => {
    const tools = data.map((row) => {
      const tool = {
        name: row["name"],
        toolFunctions: row["toolFunctions"],
        instructions: row["instructions"],
        status: row["status"],
        userMessage: row["userMessage"],
        toolDescription: row["toolDescription"],
        toolEndUserMessage: row["toolEndUserMessage"],
        toolAdditionalInstructions: row["toolAdditionalInstructions"],
      };
      return tool;
    });

    // console.log("tools", tools);

    for (const tool of tools) {
      // console.log("tool", tool);
      const extractedVariables = extractVariables(tool.userMessage);
      // console.log("extractedVariables", extractedVariables);

      const toolsInputs = extractedVariables.map((variable) => ({
        name: variable,
        label: variable, // Initialize label
        description: variable, // Initialize description
        value: "",
        type: variable.includes(".") ? "system" : "userInput",
      }));

      // console.log("toolsInputs", toolsInputs);

      const inputs = toolsInputs.map((input) => {
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

      // console.log("inputs", inputs);

      const jsonInputs = JSON.stringify(inputs);
      // Map Inputs required for Tool

      const createToolVariables = {
        name: tool.name,
        instructions: tool.instructions,
        userMessage: tool.userMessage,
        inputs: jsonInputs,
        toolDescription: tool.toolDescription,
        toolImageURL: "https://picsum.photos/800/600?random=12",
        toolEndUserMessage: tool.toolEndUserMessage,
        toolAdditionalInstructions: tool.toolAdditionalInstructions,
        toolFunctions: tool.toolFunctions,
        toolTag: "toolTag",
        status: "DRAFT",
      };

      // console.log("createToolVariables", createToolVariables);

      try {
        const { errors, data: toolRecord } = await client.models.Tool.create(
          {
            name: tool.name,
            instructions: tool.instructions,
            userMessage: tool.userMessage,
            inputs: jsonInputs,
            toolDescription: tool.toolDescription,
            toolImageURL: "https://picsum.photos/800/600?random=12",
            toolEndUserMessage: tool.toolEndUserMessage,
            toolAdditionalInstructions: tool.toolAdditionalInstructions,
            toolFunctions: tool.toolFunctions,
            toolTag: "toolTag",
            status: "DRAFT",
          },
          {
            authMode: "userPool",
          }
        );

        if (errors) {
          // console.error("Error creating tools", errors);
          return;
        }

        // console.log("Created tools", toolRecord);
        toast.success(`Tool - ${tool.name} created successfully`, {
          duration: 3000,
          position: "bottom-center",
        });
      } catch (error) {
        // console.error("Error creating tools", error);
      }
    }
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
      <PageHeading title="Bulk Upload Tools" />
      <div className="mt-8">
        <DropZone
          acceptedFileTypes={acceptedFileTypes}
          onDropComplete={({ acceptedFiles }) => setFiles(acceptedFiles)}
        >
          <Flex direction="column" alignItems="center">
            <Text>Drag CSV here or</Text>
            <Button size="small" onClick={() => hiddenInput.current?.click()}>
              Browse
            </Button>
          </Flex>
          <VisuallyHidden>
            <input
              type="file"
              tabIndex={-1}
              ref={hiddenInput}
              onChange={onFilePickerChange}
              multiple={true}
              accept={acceptedFileTypes.join(",")}
            />
          </VisuallyHidden>
        </DropZone>
        {files.length > 0 && (
          <Text>
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </Text>
        )}

        {files.map((file) => (
          <Text key={file.name}>{file.name}</Text>
        ))}
        <ButtonGroup>
          <Button
            variation="primary"
            size="small"
            onClick={uploadBulkToolsClickHandler}
          >
            Upload CSV
          </Button>
          {data.length > 0 && (
            <>
              <Button
                variation="primary"
                size="small"
                onClick={() => {
                  // console.log("Validate data", data);
                }}
              >
                Validate
              </Button>
              <Button
                variation="primary"
                size="small"
                onClick={() => {
                  // console.log("Save data", data);
                  handleCreateToolsClick(data);
                }}
              >
                Create Tools
              </Button>
            </>
          )}
        </ButtonGroup>
      </div>

      {tableHeaders.length > 0 && (
        <Flex>
          <ScrollView width="100%" height="100%" maxWidth="100%">
            <Table highlightOnHover={false} size="small" variation="bordered">
              <TableHead>
                <TableRow>
                  {/* <TableCell as="th">Actions</TableCell> */}
                  {tableHeaders.map((header) => (
                    <TableCell key={header} as="th">
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    {tableHeaders.map((header) => (
                      <TableCell key={`${index}-${header}`}>
                        <TextArea
                          className={"bg-white text-xs"}
                          value={formatValue(row[header], header)}
                          rows={10}
                          onChange={(e) => {
                            const updatedData = [...data];
                            updatedData[index][header] = e.target.value;
                            setData(updatedData);
                          }}
                        />
                        {/* {formatValue(row[header], header)} */}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollView>
        </Flex>
      )}
    </div>
  );
};

export default NewToolPage;
