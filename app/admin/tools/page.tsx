"use client";

import { Button, ButtonGroup } from "@aws-amplify/ui-react";
import { useCallback, useEffect, useState } from "react";

import AdminToolList from "@components/AdminToolList";
import { PageHeading } from "@components/ui/PageHeading";
import { Schema } from "amplify/data/resource";
import { useClient } from "contexts/ClientContext";
import { useRouter } from "next/navigation";
import { useUserGroups } from "contexts/UserGroupsContext";
import { ITool } from "interfaces";

const ToolsPage = () => {
  const [tools, setTools] = useState<ITool[]>();
  const router = useRouter();
  const { isSuperAdmin } = useUserGroups();

  const client = useClient();

  const createNewToolClickHandler = useCallback(() => {
    router.push(`/admin/tools/new`);
  }, [router]);

  const handleDeleteTool = useCallback(
    async (identifier: string) => {
      // remove relations for tags
      const { data: currentTool, errors } = await client.models.Tool.get({id: identifier});
      if (errors || !currentTool) return;
      const { data: toolTags, errors: toolTagErrors } = await currentTool.tags();
      await Promise.all(toolTags.map(async (toolTag) => {
        await client.models.ToolTag.delete({id: toolTag.id});
      }));
      // remove tool
      await client.models.Tool.delete(
        { id: identifier },
        {
          authMode: "userPool",
        }
      );
      // refresh tools
      const updatedTools = tools?.filter(tool => tool.id != identifier);
      setTools(updatedTools);
    },
    [client]
  );

  const bulkUploadClickHandler = useCallback(() => {
    router.push(`/admin/tools/bulk`);
  }, [router]);

  const handleDisableToolClick = useCallback(
    async (identifier: string) => {
      const tool = tools?.find((item) => item.id === identifier);
      if (tool) {
        const newStatus = tool.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
        await client.models.Tool.update({ id: identifier, status: newStatus });
      }
    },
    [client, tools]
  );

  const handleCloneToolClick = useCallback(
    async (identifier: string) => {
      const tool = tools?.find((item) => item.id === identifier);
      if (tool) {
        const newToolName = `${tool.name} (Clone)`;

        const createReq = {
          name: newToolName,
          instructions: tool.instructions,
          userMessage: tool.userMessage,
          inputs: tool.inputs,
          toolDescription: tool.toolDescription,
          toolImageURL: tool.toolImageURL,
          toolEndUserMessage: tool.toolEndUserMessage,
          toolAdditionalInstructions: tool.toolAdditionalInstructions,
          toolFunctions: tool.toolFunctions,
        };

        const { errors, data: updatedTool } = await client.models.Tool.create({
          ...createReq,
          status: "PENDING",
        });
        // console.log("newTool", updatedTool);
      }
    },
    [client, tools]
  );

  useEffect(() => {
    const sub = client.models.Tool.observeQuery({
      selectionSet: [
        'id', 'name', 'toolDescription', 'tags.tag.*', 'createdAt', 'instructions',
        'toolEndUserMessage', 'status', 'inputs', 'assistantId', 
        'userMessage', 'toolImageURL', 'toolAdditionalInstructions', 
        'toolFunctions', 'toolOptions', 'isFeatured', 'owners']
    }).subscribe({
      next: ({ items }) => {
        const customizedTools = items.map((tool) => {
          return {
            ...tool,
            tags: tool.tags.map(tagData => ({ id: tagData.tag.id, tagName: tagData.tag.tagName }))
          } as ITool;
        });
        setTools(customizedTools);
      },
    });
    return () => sub.unsubscribe();
  }, [client]);

  if (!isSuperAdmin) {
    return <PageHeading title="No Access" />;
  }

  return (
    <div className="m-6">
      <div className="flex justify-between">
        <PageHeading title="Tools" />
        <ButtonGroup justifyContent={"end"}>
          <Button
            variation="primary"
            size="small"
            onClick={createNewToolClickHandler}
          >
            Create New Tool
          </Button>
          <Button
            variation="primary"
            size="small"
            onClick={bulkUploadClickHandler}
          >
            Bulk Upload Tools
          </Button>
        </ButtonGroup>
      </div>
      <div className="bg-white p-5 py-0 rounded-xl border border-gray-300 mt-5">
        <AdminToolList
          tools={tools}
          handleDeleteToolClick={handleDeleteTool}
          handleDisableToolClick={handleDisableToolClick}
          handleCloneToolClick={handleCloneToolClick}
        />
      </div>
    </div>
  );
};

export default ToolsPage;
