import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";

// Temporarily storing user information locally, this is not safe and must be changed

function SignIn() {
  const [userInfo, setUserInfo] = useState(null);
  const [username, setUsername] = useState("");
  const [finalUsername, setFinalUsername] = useState(null);

  useEffect(() => {
    // On mount, see if we already have a user + chosen username in localStorage
    const savedUser = localStorage.getItem("userInfo");
    const savedUsername = localStorage.getItem("finalUsername");

    if (savedUser) {
      setUserInfo(JSON.parse(savedUser));
    }
    if (savedUsername) {
      setFinalUsername(savedUsername);
    }
  }, []);

  const handleSuccess = (credentialResponse) => {
    // Decode the JWT from credentialResponse
    const token = credentialResponse.credential;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(window.atob(base64));

    // Minimal example: store name & maybe email
    const user = {
      googleName: decodedPayload.name,
      googleEmail: decodedPayload.email,
    };

    // Save user info in localStorage
    localStorage.setItem("userInfo", JSON.stringify(user));
    setUserInfo(user);
  };

  const handleError = () => {
    console.log("Login Failed");
  };

  const handleSignOut = () => {
    // Clear user data from localStorage & state
    localStorage.removeItem("userInfo");
    localStorage.removeItem("finalUsername");
    setUserInfo(null);
    setFinalUsername(null);
    setUsername("");
  };

  // Called when user submits the username form
  const handleUsernameConfirm = () => {
    if (!username.trim()) return; // Don't allow blank
    // Save in localStorage
    localStorage.setItem("finalUsername", username);
    setFinalUsername(username);
  };

  return (
    <div>
      {/* CASE 1: Not signed in at all */}
      {!userInfo && !finalUsername && (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          size="large"
          shape="pill"
          text="signin_with"
        />
      )}

      {/* CASE 2: Signed in, but no permanent username chosen yet */}
      {userInfo && !finalUsername && (
        <div className="space-y-4">
          <p className="text-lg font-semibold">Signed in via Google as {userInfo.googleName}</p>
          <p className="text-sm text-red-400">
            Please pick a username. <strong>This will be permanent.</strong>
          </p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your unique username"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none"
          />
          <button
            onClick={handleUsernameConfirm}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 w-full"
          >
            Confirm Username
          </button>
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 w-full"
          >
            Cancel & Sign Out
          </button>
        </div>
      )}

      {/* CASE 3: Signed in & username is final */}
      {userInfo && finalUsername && (
        <div className="p-4 bg-gray-800 text-white rounded-md shadow-md flex flex-col items-center space-y-4">
          <p className="text-lg font-semibold">Logged in as: {finalUsername}</p>
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default SignIn;
