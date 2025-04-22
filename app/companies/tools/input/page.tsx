"use client";

import { Badge, Loader } from "@aws-amplify/ui-react";
import React, { useEffect } from "react";

import { Button } from "@components/shadcn/ui/button";
import { Card } from "@components/shadcn/ui/card";
import { Label } from "@components/shadcn/ui/label";
import { Textarea } from "@components/shadcn/ui/textarea";
import { sendGTMEvent } from "@next/third-parties/google";
import { Schema } from "amplify/data/resource";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useClient } from "contexts/ClientContext";
import { useUserGroups } from "contexts/UserGroupsContext";
import { withCompanyAuthorization } from "contexts/withCompanyAuthorization";
import { SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ICompanyState, IThread, ITool } from "interfaces";
import { useDispatch, useSelector } from "react-redux";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { setThreadAction } from "@redux/actions/companyAction";

interface DatasetField {
  inputFieldPlaceholder: string;
  inputFieldLabel: string;
  inputFieldRequired: boolean;
  inputFieldName: string;
  inputFieldDescription: string;
  inputFieldType: string;
  inputFieldOptions?: string[]; // optional, as it might not always be present
}

const InputPage = () => {
  const router = useRouter();
  const client = useClient();
  const dispatch = useDispatch();
  
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany: company, selectedTool } = companyState;
  const companyId = company?.id, 
        toolId = selectedTool?.id;
  const { isServicesClient } = useUserGroups();
  const [toolInputs, setToolInputs] = React.useState<DatasetField[]>([]);
  const [inputValues, setInputValues] = React.useState<{
    [key: string]: string;
  }>({});
  const [inputLoading, setInputLoading] = React.useState<boolean>(false);
  // const [isPageLoading, setIsPageLoading] = React.useState<boolean>(false);

  const handleCancelClick = () => {
    router.back();
  };

  const handleInitToolClickV2 = async () => {
    setInputLoading(true);
    sendGTMEvent({
      event: "tool_input_submitted",
      toolId: toolId,
      companyId: companyId,
      timestamp: new Date().toISOString(),
    });
    let hasExhaustedFreeUsage = false;
    const userAttributes = await fetchUserAttributes();
    const isPaidMember = userAttributes["custom:isPaidMember"] === "true";

    if (!isPaidMember) {
      const { data: threads, errors: getThreadsError } =
        await client.models.Thread.list({
          filter: {
            status: { eq: "COMPLETED" },
          },
        });
      if (getThreadsError) {
        toast.error("Error fetching threads", {
          duration: 3000,
          position: "bottom-center",
        });
        setInputLoading(false);
        return;
      }
      if (threads.length >= 3) {
        hasExhaustedFreeUsage = true;
      }
    }

    if (!selectedTool) {
      toast.error("Tool not found", {
        duration: 3000,
        position: "bottom-center",
      });
      setInputLoading(false);
      return;
    }

    const jsonPayload = JSON.stringify(inputValues);

    if (!company) {
      toast.error("Company not found, please select company", {
        duration: 3000,
        position: "bottom-center",
      });
      setInputLoading(false);
      return;
    }

    const { data: thread, errors: createThreadError } =
      await client.models.Thread.create({
        toolId: selectedTool.id,
        name: selectedTool.name,
        intialPayload: jsonPayload,
        status: "DRAFT",
        companyId,
      });

    if (createThreadError) {
      toast.error("Error creating thread", {
        duration: 3000,
        position: "bottom-center",
      });
      setInputLoading(false);
      return;
    }

    if (!thread) {
      toast.error("Error creating thread", {
        duration: 3000,
        position: "bottom-center",
      });
      setInputLoading(false);
      return;
    }
    sendGTMEvent({
      event: "tool_initited",
      toolId: selectedTool.id,
      companyId: companyId,
      threadId: thread.id,
      startTime: new Date().toISOString(),
    });
    // console.log("current thread: ", thread, thread as unknown as IThread);
    dispatch(setThreadAction(thread as unknown as IThread));

    try {
      setInputLoading(false);

      if (isServicesClient) {
        router.push(
          // `/company/${companyId}/program-management/tools/${toolId}/viewV2/${thread.id}`
          `/companies/tools/threads/thread`
        );
      } else if (!isPaidMember && hasExhaustedFreeUsage) {
        router.push(
          `/purchase?companyId=${companyId}&toolId=${toolId}&threadId=${thread.id}`
        );
      } else {
        router.push(
          // `/company/${companyId}/program-management/tools/${toolId}/viewV2/${thread.id}`
          `/companies/tools/threads/thread`
        );
      }
    } catch (error) {
      toast.error("Error processing your request", {
        duration: 3000,
        position: "bottom-center",
      });
    }
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setInputValues((prevValues) => ({ ...prevValues, [fieldName]: value }));
  };

  useEffect(() => {
    // setIsPageLoading(true);
    // console.log("company and selected tool: ", company, selectedTool);
    /* const fetchTool = async () => {
      try {
        const { data: tool } = await client.models.Tool.get({
          id: toolId,
        });
        if (!tool) {
          // console.log("Tool not found");
          return;
        }
        setTool(tool);
        setIsPageLoading(false);
        const inputs = tool?.inputs;
        if (inputs) {
          const parsedInputs = JSON.parse(String(inputs));
          // console.log(parsedInputs);
          setToolInputs(parsedInputs);
        }
      } catch (error) {
        // console.log(error);
      }
    };

    fetchTool(); */
    if (selectedTool && selectedTool.inputs) {
      const parsedInputs = JSON.parse(String(selectedTool.inputs));
      setToolInputs(parsedInputs);
    }
  }, [toolId]);

  useEffect(() => {
    if (toolInputs.length > 0) {
      const initialValues = toolInputs.reduce((values, input) => {
        values[input.inputFieldName] = ""; // default value
        return values;
      }, {} as { [key: string]: string });
      setInputValues(initialValues);
    }
  }, [toolInputs]);

  useEffect(() => {
    if (selectedTool) {
      sendGTMEvent({
        event: "tool_input_viewed",
        toolId: selectedTool?.id || "Unknown",
        toolName: selectedTool?.name || "Unknown",
        companyId: companyId,
        timestamp: new Date().toISOString(),
      });
    }
  }, [selectedTool]);

  /* if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  } */

  return (
    <div className="m-6">
      <Card className="p-6">
        <div className="pb-4">
          <div className="text-lg font-bold">{selectedTool?.name}</div>
          <div>
            <p className="text-sm text-muted-foreground font-dm max-w-[80%]">
              {selectedTool?.toolEndUserMessage || ""}
            </p>
          </div>
        </div>
        <div>
          {toolInputs.map((input) => (
            <div key={input.inputFieldName}>
              {input.inputFieldType === "userInput" && (
                <div className="mt-4 flex flex-col gap-2">
                  <Label htmlFor={input.inputFieldName}>
                    {input.inputFieldLabel}
                  </Label>
                  <Textarea
                    id={input.inputFieldName}
                    placeholder={input.inputFieldDescription}
                    rows={4}
                    value={inputValues[input.inputFieldName] || ""}
                    onChange={(e) =>
                      handleInputChange(input.inputFieldName, e.target.value)
                    }
                    className="bg-white"
                  />
                </div>
              )}
            </div>
          ))}
          <div className="mt-4">
            <p className="text-sm">Brand lens variables used:</p>
          </div>
          <div className="flex gap-2 flex-wrap mt-2">
            {toolInputs.map((input) => (
              <div className="text-sm" key={input.inputFieldName}>
                {input.inputFieldType === "system" && (
                  <Badge size="small">{input.inputFieldName}</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
      <div className="mt-5">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => handleCancelClick()}>
            Back
          </Button>
          <Button
            onClick={() => handleInitToolClickV2()}
            className="flex gap-1"
          >
            <SparklesIcon height={16} width={16} />
            {inputLoading ? "Generating..." : "Generate Response"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default withCompanyAuthorization(InputPage);
