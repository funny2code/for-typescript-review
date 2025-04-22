"use client";

import { Clipboard, SparklesIcon } from "lucide-react";
import { useEffect, useState, useRef, forwardRef, ForwardedRef, useImperativeHandle } from "react";

import { Button } from "@components/shadcn/ui/button";
// import { Input } from "@components/shadcn/ui/input";
import { sendGTMEvent } from "@next/third-parties/google";
import { setAIEditorAction } from "@redux/actions/aieditorAction";
import { Schema } from "amplify/data/resource";
import { fetchAuthSession } from "aws-amplify/auth";
import ToolLoader from "components/Tools/ToolLoader";
import { toolStreamLambdaInvokeUrl } from "config/config";
import { useClient } from "contexts/ClientContext";
import { withCompanyAuthorization } from "contexts/withCompanyAuthorization";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { Textarea } from "@components/shadcn/ui/textarea";
import { ICompanyState } from "interfaces";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { toast } from "sonner";

type CustomInputProp = {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (message: string) => Promise<void>;
}
interface TextAreaHandle {
  clear(): void;
};
const CustomInput = forwardRef<TextAreaHandle, CustomInputProp>(({
  placeholder, value, onChange, onSubmit
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => ({
    clear: () => {
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.style.height = 'auto';
      }
    }
  }));
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault(); // Prevents new line on Enter key press without Shift
          onSubmit(value);
          if (textareaRef.current) {
            textareaRef.current.value = "";
            textareaRef.current.style.height = 'auto';
          }
      }
  };

  const handleInput = () => {
      if (textareaRef.current) {
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

          if (!textareaRef.current.value.length) {
            textareaRef.current.style.height = 'auto';
          }
      }
  };

  return (
    <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        style={{
            height: '20px ', /* Initially looks like a single-line input */
            overflow: 'hidden', /* Hide scrollbar when not needed */
            resize: 'none', /* Prevent resizing by the user */
            boxSizing: 'border-box' /* Include padding and border in the element's total width and height */
        }}
        onChange={onChange}
    />
  );
});
CustomInput.displayName = "CustomInput";

const ThreadViewerPage = () => {
  const [isTextCopied, setIsTextCopied] = useState(false);
  const router = useRouter();

  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany, selectedTool, selectedThread } = companyState;

  // const { companyId, threadId, toolId } = params;
  const companyId = selectedCompany?.id,
        threadId = selectedThread?.id,
        toolId = selectedTool?.id;

  const client = useClient();
  const [messages, setMessages] = useState<Schema["Message"]["type"][]>([]);
  const [tool, setTool] = useState<Schema["Tool"]["type"]>();
  const [data, setData] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const baseFunctionUrl = toolStreamLambdaInvokeUrl;
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const dispatch = useDispatch();
  const messageBoxRef = useRef<TextAreaHandle>(null);

  useEffect(() => {
    if (!companyId || !threadId || !toolId) {
      router.back();
    }
  })
  const handleEditRequest = async (message: any) => {
    dispatch(setAIEditorAction({ key: "content", value: message }));
    sendGTMEvent({
      event: "tool_response_edited",
      toolId: toolId,
      threadId: threadId,
      messageId: message.id,
      timestamp: new Date().toISOString(),
    });
    router.push(`/ai-editor`);
  };

  const getThread = async () => {
    const { data: thread, errors: getThreadError } =
      await client.models.Thread.get({
        id: threadId!,
      });
    if (getThreadError) {
      toast.error("Error fetching threads", {
        duration: 3000,
        position: "bottom-center",
      });
    }

    if (!thread) {
      toast.error("Thread not found", {
        duration: 3000,
        position: "bottom-center",
      });
      return;
    }

    const { data: messages, errors: getMessagesError } =
      await thread.messages();

    if (getMessagesError) {
      toast.error("Error fetching messages", {
        duration: 3000,
        position: "bottom-center",
      });
    }

    const sortedMessages = (messages as Schema["Message"]["type"][]).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    setMessages(sortedMessages as Schema["Message"]["type"][]);

    return sortedMessages;
  };

  const fetchData = async (url: string) => {
    setLoading(true);

    const session = await fetchAuthSession();

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.tokens?.idToken}`,
        },
        cache: "no-store",
      });

      if (!response.body) {
        // console.error("Failed to get response body");
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setData((prevData) => [...prevData, chunk]);
        }
      }
    } catch (error) {
      // console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  const sendMessage = async (message: string) => {
    if (!message) {
      return;
    }
    setSending(true);
    const { data: messageData, errors } = await client.models.Message.create({
      content: message,
      threadId: threadId,
      role: "user",
    });

    if (messageData) {
      sendGTMEvent({
        event: "tool_message_sent",
        toolId: toolId,
        threadId: threadId,
        timestamp: new Date().toISOString(),
      });
      setMessage("");
      if (messageBoxRef.current) {
        messageBoxRef.current.clear();
      }
    }

    if (errors) {
      toast.error("Error sending message", {
        duration: 3000,
        position: "bottom-center",
      });
    }

    if (!messageData) {
      toast.error("Message not found", {
        duration: 3000,
        position: "bottom-center",
      });
      return;
    }
    const url = `${baseFunctionUrl}?threadId=${encodeURIComponent(
      threadId!
    )}&toolId=${encodeURIComponent(toolId!)}&companyId=${encodeURIComponent(
      companyId!
    )}&messageId=${encodeURIComponent(messageData.id)}`;
    await fetchData(url);
    setSending(false);
  };

  useEffect(() => {
    const fetchTool = async () => {
      if (!toolId) {
        return;
      }

      try {
        const { data: tool } = await client.models.Tool.get({
          id: toolId,
        });
        if (!tool) {
          toast.error("Tool not found", {
            duration: 3000,
            position: "bottom-center",
          });
          return;
        }
        setTool(tool);
      } catch (error) {
        toast.error("Error fetching tool", {
          duration: 3000,
          position: "bottom-center",
        });
      }
    };

    const fetchInitialData = async () => {
      const existingMessages = await getThread();
      if (!existingMessages) {
        return;
      }

      if (existingMessages.length === 0) {
        const url = `${baseFunctionUrl}?threadId=${encodeURIComponent(
          threadId!
        )}&toolId=${encodeURIComponent(toolId!)}&companyId=${encodeURIComponent(
          companyId!
        )}`;
        fetchData(url);
      }
    };

    fetchTool();
    if (messages.length === 0) {
      fetchInitialData();
      sendGTMEvent({
        event: "tool_response_viewed",
        toolId: toolId,
        threadId: threadId,
        companyId: companyId,
        timestamp: new Date().toISOString(),
      });
    }

    const sub = client.models.Message.observeQuery({
      filter: {
        threadId: { eq: threadId },
      },
    }).subscribe({
      next: ({ items }) => {
        if (!items) {
          return;
        }

        const newMessages = items.filter(
          (item) => !messages.some((prevMessage) => prevMessage.id === item.id)
        );

        newMessages.forEach((newMessage) => {
          if (newMessage.role === "ai") {
            sendGTMEvent({
              event: "tool_response_received",
              toolId: toolId,
              threadId: threadId,
              messageId: newMessage.id,
              timestamp: new Date().toISOString(),
            });
          }
        });

        setMessages((prevMessages) => {
          const newMessages = [
            ...prevMessages,
            ...items.filter(
              (item) =>
                !prevMessages.some((prevMessage) => prevMessage.id === item.id)
            ),
          ] as Schema["Message"]["type"][];
          return newMessages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        setData([]);
      },
      error: (err) => {
        /* console.error(err) */
      },
    });

    return () => sub.unsubscribe();
  }, [threadId, toolId]);

  if (!companyId || !threadId || !toolId || !tool || !tool.name) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white p-6 m-6 rounded-xl border border-gray-300">
      <div>
        <div className="max-w-[712px] m-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">{tool.name}</h1>
          </div>
          <div>
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className="mb-4">
                  <div>
                    <div className="text-right text-xs text-gray-300 hidden">
                      {message.aiMessageId}
                    </div>
                    <div className="text-right text-xs hidden">
                      {message.role}
                    </div>
                    <div className="message-content w-fit bg-gray-100 px-5 py-3 rounded-lg shadow-sm false">
                      <Markdown
                        remarkPlugins={[
                          remarkGfm,
                          remarkBreaks,
                          rehypeStringify,
                          remarkParse,
                          remarkRehype,
                        ]}
                      >
                        {message.content || ""}
                      </Markdown>
                    </div>
                  </div>

                  <div className="text-right">
                    {message.role === "ai" && (
                      <div className="flex justify-end gap-2 mt-5">
                        <Button
                          className="flex gap-1"
                          variant={"outline"}
                          onClick={() => {
                            navigator.clipboard.writeText(
                              message.content || ""
                            );
                            sendGTMEvent({
                              event: "tool_response_copied",
                              toolId: toolId,
                              threadId: threadId,
                              messageId: message.id,
                              timestamp: new Date().toISOString(),
                            });
                            toast.success("Message Copied!", {
                              duration: 3000,
                              position: "bottom-center",
                            });
                          }}
                        >
                          <Clipboard className="h-4 w-4" />
                          {isTextCopied ? "Copied!" : "Copy"}
                        </Button>
                        <Button
                          onClick={() => handleEditRequest(message.content)}
                          className="flex gap-1"
                        >
                          <SparklesIcon height={16} width={16} />
                          Edit in Smart Editor
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <></>
            )}
          </div>

          <div className="max-w-[712px] m-auto">
            <div className="message-content w-fit bg-gray-100 px-5 py-3 rounded-lg shadow-sm false">
              <Markdown
                remarkPlugins={[
                  remarkGfm,
                  remarkBreaks,
                  rehypeStringify,
                  remarkParse,
                  remarkRehype,
                ]}
              >
                {data.join("")}
              </Markdown>
            </div>
            {loading && (
              <div className="text-center">
                <ToolLoader />
              </div>
            )}
            <div className="mt-4 flex">
              <div className="grow">
                {/* <Input
                  type="text"
                  placeholder="Ask AI..."
                  className="w-full rounded-lg bg-background pl-2"
                  onChange={({ target: { value } }) => setMessage(value)}
                  value={message}
                /> */}
                <CustomInput 
                  ref={messageBoxRef}
                  placeholder="Ask AI ..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onSubmit={sendMessage}
                />
              </div>
              <div className="ml-2">
                <Button onClick={() => sendMessage(message)} disabled={sending}>
                  {sending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withCompanyAuthorization(ThreadViewerPage);
