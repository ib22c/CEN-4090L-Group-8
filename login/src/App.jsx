import React, { useState, useEffect } from "react";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const fetchAPI = async () =>{
    const response  = await axios.get("https://localhost:3000/api");
    console.log(response.data.group8);
  };

  useEffect(() => {
    fetchAPI();
  },[]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (err) {
      setMessage("Error connecting to server");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (err) {
      setMessage("Error connecting to server");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4 font-bold">Login</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 mb-4 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-between">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleLogin}
          >
            Login
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleRegister}
          >
            Register
          </button>
        </div>

        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}