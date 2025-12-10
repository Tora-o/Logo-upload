import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="264248176378-685rdn1ge28bpfj65j2k93dhj7k99096.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
