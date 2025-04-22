export const loadGoogleApi = (callback: () => void) => {
  const script = document.createElement("script");
  script.src = "https://apis.google.com/js/api.js";
  script.onload = callback;
  document.body.appendChild(script);
};

export const initializeGoogleApi = (
  apiKey: string,
  clientId: string,
  callback: () => void
) => {
  window.gapi.load("client:auth2", () => {
    window.gapi.client
      .init({
        apiKey: apiKey,
        clientId: clientId,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        ],
        scope: "https://www.googleapis.com/auth/drive.file",
        plugin_name: "fomodev",
      })
      .then(callback);
  });
};

export const initClient = (apiKey: string, clientId: string) => {
  return window.gapi.client
    .init({
      apiKey: apiKey,
      clientId: clientId,
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      ],
      scope: "https://www.googleapis.com/auth/drive.file",
      plugin_name: "fomodev",
    })
    .then(() => {
      // Add any necessary initialization logic here
    });
};
