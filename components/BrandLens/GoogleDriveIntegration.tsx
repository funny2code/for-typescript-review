// import { useClient } from "../hooks/useClient";
import {
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Text,
} from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";

import { kMaxLength } from "buffer";
import { loadGoogleApi } from "utils/googleDriveUtils";
import { marked } from "marked";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useClient } from "contexts/ClientContext";

// import { mutations } from "../graphql/mutations";

interface GoogleDriveIntegrationProps {
  getCombinedWrittenContent: () => string;
  title: string;
  draftId: string;
}

const API_KEY = "---";
const CLIENT_ID =
  "---";

const GoogleDriveIntegration = ({
  getCombinedWrittenContent,
  title,
  draftId,
}: GoogleDriveIntegrationProps) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const client = useClient();
  const [isConnected, setIsConnected] = useState(false);
  const [files, setFiles] = useState<{ name: string; id: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const saveTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("googleAccessToken", accessToken);
    localStorage.setItem("googleRefreshToken", refreshToken);
    setToken(accessToken);
    setRefreshToken(refreshToken);
  };

  const loadTokens = () => {
    const savedAccessToken = localStorage.getItem("googleAccessToken");
    const savedRefreshToken = localStorage.getItem("googleRefreshToken");
    if (savedAccessToken && savedRefreshToken) {
      setToken(savedAccessToken);
      setRefreshToken(savedRefreshToken);
      return true;
    }
    return false;
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return;

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: "YOUR_CLIENT_ID",
          client_secret: "YOUR_CLIENT_SECRET",
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      const data = await response.json();
      saveTokens(data.access_token, refreshToken);
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  // const loadGoogleApi = (p0?: () => void) => {
  //   const script = document.createElement("script");
  //   script.src = "https://apis.google.com/js/api.js";
  //   script.onload = initializeGoogleApi;
  //   document.body.appendChild(script);
  // };

  const initializeGoogleApi = (
    API_KEY?: string,
    CLIENT_ID?: string,
    p0?: () => void
  ) => {
    window.gapi.load("client:auth2", initClient);
  };

  const initClient = () => {
    window.gapi.client
      .init({
        apiKey: "AIzaSyCWh_riqqyOsbl8NsfAsI1w76_3Ti_sYA0",
        clientId:
          "705870104088-sjg8d5b01ht6foqsco53k5aud6ic7gi3.apps.googleusercontent.com",
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        ],
        scope: "https://www.googleapis.com/auth/drive.file",
        plugin_name: "fomodev",
      })
      .then(() => {
        kMaxLength;
      });
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const googleUser = await window.gapi.auth2.getAuthInstance().signIn();
      console.log("Google User:", googleUser);
      const authResponse = googleUser.getAuthResponse(true);
      saveTokens(authResponse.access_token, authResponse.refresh_token);

      console.log("Auth Response:", authResponse);
      const accessToken = authResponse.access_token;
      console.log("Access Token:", accessToken);

      setIsConnected(true);
      fetchFiles();
    } catch (error) {
      console.error("Error connecting to Google Drive:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await window.gapi.client.drive.files.list({
        pageSize: 10,
        fields: "nextPageToken, files(id, name)",
      });
      console.log("Files:", response.result.files);
      setFiles(response.result.files);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const createFile = async () => {
  //   setIsLoading(true);
  //   try {
  //     const fileMetadata = {
  //       name: title,
  //       mimeType: "application/vnd.google-apps.document",
  //     };

  //     const fileContent = await getCombinedWrittenContent();

  //     const file = new Blob([fileContent], { type: "text/plain" });

  //     const accessToken = window.gapi.auth.getToken().access_token;
  //     const form = new FormData();
  //     form.append(
  //       "metadata",
  //       new Blob([JSON.stringify(fileMetadata)], { type: "application/json" })
  //     );
  //     form.append("file", file);

  //     const response = await fetch(
  //       "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
  //       {
  //         method: "POST",
  //         headers: new Headers({ Authorization: "Bearer " + accessToken }),
  //         body: form,
  //       }
  //     );

  //     const result = await response.json();
  //     console.log("File created:", result);
  //     await client.models.Draft.update({
  //       id: draftId,
  //       gdocId: result.id,
  //     });

  //     fetchFiles();
  //   } catch (error) {
  //     console.error("Error creating file:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const createFile = async () => {
    setIsLoading(true);
    try {
      const titleWithTimeStamp = `${title} - ${new Date().toLocaleString()}`;
      const fileMetadata = {
        name: titleWithTimeStamp,
        mimeType: "application/vnd.google-apps.document",
      };

      const markdownContent = await getCombinedWrittenContent();
      const htmlContent = await marked(markdownContent); // Convert Markdown to HTML

      const file = new Blob([htmlContent], { type: "text/html" }); // Change type to "text/html"

      const accessToken = window.gapi.auth.getToken().access_token;
      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(fileMetadata)], { type: "application/json" })
      );
      form.append("file", file);

      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: new Headers({ Authorization: "Bearer " + accessToken }),
          body: form,
        }
      );

      const result = await response.json();
      console.log("File created:", result);
      await client.models.Draft.update({
        id: draftId,
        gdocId: result.id,
      });

      fetchFiles();
    } catch (error) {
      console.error("Error creating file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (window.gapi && window.gapi.client) {
      fetchFiles();
    }
  }, []);

  useEffect(() => {
    loadGoogleApi(() =>
      initializeGoogleApi(API_KEY, CLIENT_ID, () => {
        // Any additional initialization logic can go here
        console.log("Google API initialized");
      })
    );
  }, []);

  useEffect(() => {
    if (loadTokens()) {
      setIsConnected(true);
      fetchFiles();
    }
  }, []);

  return (
    <Card className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Flex direction="column" gap="1.5rem">
        <Heading level={3} className="text-3xl font-bold text-gray-800">
          Google Drive Integration
        </Heading>

        {!isConnected ? (
          <Button onClick={handleConnect} isLoading={isLoading}>
            Connect to Google Drive
          </Button>
        ) : (
          <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            Connected
          </Badge>
        )}
        <Button onClick={createFile}>Create File</Button>

        {isConnected && (
          <Flex direction="column" gap="1rem">
            <Text className="font-semibold">Your Google Drive Files:</Text>
            {files.map((file: any) => (
              <Text key={file.id}>{file.name}</Text>
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default GoogleDriveIntegration;
