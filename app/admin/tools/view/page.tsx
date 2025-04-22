"use client";

import { Button, TextAreaField, TextField } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";

import { Schema } from "amplify/data/resource";
import { openAIPlayground } from "constants/admin";
import { useClient } from "contexts/ClientContext";
import { useRouter } from "next/navigation";

type Tool = Schema["Tool"]["type"];

const DummyPage = ({ params }: { params: { toolId: string } }) => {
  const router = useRouter();
  const { toolId } = params;
  const client = useClient();

  const [tool, setTool] = useState<Tool>();
  const [toolName, setToolName] = useState<string>("New Tool");
  const [toolInstruction, setToolInstruction] = useState<string>(
    "New Tool Instruction"
  );

  const editToolClickHandler = () => {
    router.push(`/admin/tools/${toolId}/edit`);
  };

  const playGroundToolClickHandler = () => {
    window.open(`${openAIPlayground}${tool?.assistantId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: tool } = await client.models.Tool.get({
          id: toolId as string,
        });
        if (!tool) {
          // console.log("Tool not found");
          return;
        }
        setTool(tool);
        setToolName(tool.name as string);
        setToolInstruction(tool.instructions + "");
      } catch (error) {
        // console.log(error);
      }
    };

    fetchData();
  }, [toolId]);

  return (
    <div>
      <h1>View Tool</h1>
      <p>Tool Id - {toolId}</p>
      <p>Tool Status: {tool?.status}</p>
      <p>Assistant Id: {tool?.assistantId}</p>
      <Button
        variation="primary"
        size="small"
        onClick={playGroundToolClickHandler}
      >
        Playground
      </Button>
      <div className="mt-8">
        <div className="my-3">
          <TextField
            descriptiveText="Enter Tool Name"
            placeholder="Enter Tool Name"
            label="Tool Name"
            errorMessage="There is an error"
            name="toolName"
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
            disabled={true}
          />
        </div>
        <TextAreaField
          descriptiveText="Enter Instructions"
          label="Instructions"
          name="instructions"
          placeholder="Enter Instructions"
          rows={10}
          resize="vertical"
          value={toolInstruction}
          onChange={(e) => setToolInstruction(e.target.value)}
          disabled={true}
        />
        <div className="mt-4 text-right">
          <Button
            variation="primary"
            size="small"
            onClick={editToolClickHandler}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DummyPage;
