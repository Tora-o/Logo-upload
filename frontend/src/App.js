import { useState } from "react";
import "./App.css";
import { useGoogleLogin } from "@react-oauth/google";

// 🔹 CHANGE THIS to your real Render backend URL
const API_BASE_URL = "https://logo-upload-backend.onrender.com";

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const login = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: (tokenResponse) => {
      console.log("Login success:", tokenResponse);
      setAccessToken(tokenResponse.access_token);
      setMessage("Logged in! You can upload your logo now.");
    },
    onError: () => {
      setMessage("Login failed");
    },
  });

  const handleUpload = async () => {
    if (!accessToken) {
      setMessage("Please sign in with Google first.");
      return;
    }
    if (!file) {
      setMessage("Please choose an image first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("accessToken", accessToken);

const res = await fetch(`${API_BASE_URL}/api/upload`, {
  method: "POST",
  body: formData,
})

      const data = await res.json();
      setMessage(data.message || "Upload finished.");
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Check the server.");
    }
  };

  return (
    <div className="App" style={{ padding: 40 }}>
      <h1>School Logo Making Competition</h1>

      {!accessToken && (
        <button onClick={() => login()}>Sign in with Google</button>
      )}

      {accessToken && (
        <div style={{ marginTop: 20 }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button onClick={handleUpload} style={{ marginLeft: 10 }}>
            Upload Logo
          </button>
        </div>
      )}

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
}

export default App;
