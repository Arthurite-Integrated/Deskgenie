"use client"

import { OpenAIRealtimeWebRTC, RealtimeSession } from "@openai/agents/realtime";
import { Power, Settings, AArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import p from "./p.json";
import { agent } from "./agent";
import IntegrationsModal from "./components/ConnectModal";
import { useAuth } from "./contexts/AuthContext";
import DeskGenieClient from "./utils/DeskGenie";

export default function DeskGenie() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const { signOut } = useAuth();
  const genie = new DeskGenieClient();
  const session = useRef<RealtimeSession | null>(null);
  const [genieState, setGenieState] = useState<"connected" | "connecting" | "disconnected">(
    "disconnected",
  );
  const [connected, setConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>("");

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isCallActive]);

  const handleCallToggle = async () => {
    console.log("Button clicked! Current state:", isCallActive);
    if (isCallActive) {
      // Stop call
      console.log("🛑 Stopping call...");
      setIsCallActive(false);
      setCallDuration(0);

      await startConnection();
    } else {
      console.log("▶️ Starting call...");
      setIsCallActive(true);
      await startConnection();
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) {
      console.warn("⚠️ Empty message, not sending");
      return;
    }

    if (!connected || !session.current) {
      console.warn("⚠️ No active session, cannot send message");
      alert("Please connect to Genie first by clicking the main button!");
      setIsTextModalOpen(false);
      return;
    }

    try {
      console.log("📤 Sending message to AI:", messageInput);
      // Send the message to the AI agent
      session.current.sendMessage(messageInput);
      
      // Clear the input and close modal
      setMessageInput("");
      setIsTextModalOpen(false);
      
      // If not already in a call, start one
      if (!isCallActive) {
        setIsCallActive(true);
        if (genieState === "disconnected") {
          await startConnection();
        }
      }
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    }
  };

  const startConnection = async () => {
    console.log("🚀 Starting connection process...");
    setGenieState("connecting");

    try {
      if (connected) {
        setConnected(false);
        await session.current?.close();
      } else {
        // Get token and connect
        const token = await genie.getSessionToken();
        console.log("🎫 Got token:", token);
        const transport = new OpenAIRealtimeWebRTC({
          useInsecureApiKey: true
        });

        session.current = new RealtimeSession(agent, {
          transport,
          model: "gpt-4o-realtime-preview-2025-06-03",
          config: {
            turnDetection: {
              type: "semantic_vad",
              eagerness: "medium",
              createResponse: true,
              interruptResponse: true,
            },
            instructions: `
            
            You should greet the user immediately when the session starts. Be friendly and ask how you can help them today.
            `
          },
        });

        session.current.on("transport_event", (e) => {
          console.log(e);
        });
        
        await session.current.connect({ apiKey: token, });
        
        // Send initial greeting message immediately after connection
        session.current.sendMessage(`
          # You're an english speaking Agent, only speak other language when you're asked to or you detect other language okay!!
          Please greet the user now and ask how you can help them.
          `);

        
        session.current.on("transport_event", (e) => {
          console.log(e);
        });
        
        await session.current.connect({ apiKey: token, });
        
        // session.current.sendMessage('Greet the user')
        // Set connected state
        setConnected(true);
        setGenieState("connected");
        console.log("✅ Successfully connected!");
      }
    } catch (error) {
      console.error("❌ Connection failed:", error);
      setGenieState("disconnected");
      setIsCallActive(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Update the status text in header
  const getStatusText = () => {
    if (genieState === "disconnected") {
      return "ONLINE";
    } else if (genieState === "connecting") {
      return "CONNECTING";
    } else if (genieState === "connected" && isCallActive) {
      return `CONNECTED ${formatTime(callDuration)}`;
    } else {
      return "CONNECTED";
    }
  };

  // Update the status colors
  const getStatusColors = () => {
    if (genieState === "disconnected") {
      return {
        bg: "bg-green-500/10 border-green-400/30 shadow-green-500/10",
        dot: "bg-green-400 shadow-green-400/50",
      };
    } else if (genieState === "connecting") {
      return {
        bg: "bg-yellow-500/10 border-yellow-400/30 shadow-yellow-500/10",
        dot: "bg-yellow-400 shadow-yellow-400/50",
      };
    } else if (isCallActive) {
      return {
        bg: "bg-red-500/20 border-red-400/50 shadow-red-500/20",
        dot: "bg-red-400 shadow-red-400/50",
      };
    } else {
      return {
        bg: "bg-emerald-500/10 border-emerald-400/30 shadow-emerald-500/10",
        dot: "bg-emerald-400 shadow-emerald-400/50",
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white overflow-hidden">
      {isModalOpen && (
        <IntegrationsModal isOpen={true} setIsOpen={() => setIsModalOpen(!isModalOpen)} />
      )}

      {/* Text Input Modal */}
      {isTextModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setIsTextModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl p-8 mx-4 w-full max-w-md shadow-2xl border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Send Message to Genie
              </h2>
              <p className="text-gray-600 text-sm">
                Type your message and Genie will respond
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-4 border border-gray-200 rounded-2xl bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows={4}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleSendMessage();
                  }
                }}
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsTextModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                >
                  Send Message
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Press Ctrl/Cmd + Enter to send quickly
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Background Pattern */}
      {/* <button
        onClick={() => alert("hi")}
        className="bg-red-500 absolute z-10 text-white h-30 px-4 py-2 rounded hover:bg-red-600"
      >
        Sign Out
      </button> */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>

      {/* Main Container */}
      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <div className="w-full px-6 md:px-12 lg:px-16 py-4 md:py-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <button
              type="button"
              onClick={() => {
                if (connected && session.current) {
                  setIsTextModalOpen(true);
                }
              }}
              disabled={!connected || !session.current}
              className={`group relative z-50 p-3 md:p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                connected && session.current
                  ? "bg-white/5 hover:bg-white/10 border-white/10 hover:scale-105 cursor-pointer"
                  : "bg-white/2 border-white/5 cursor-not-allowed opacity-50"
              }`}
              title={connected && session.current ? "Send text message to Genie" : "Connect to Genie first to send messages"}
            >
              <AArrowUp 
                className={`w-5 h-5 md:w-6 md:h-6 transition-colors ${
                  connected && session.current
                    ? "text-white/80 group-hover:text-white"
                    : "text-white/30"
                }`} 
              />
            </button>

            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 backdrop-blur-sm rounded-2xl border transition-all duration-300 ${getStatusColors().bg}`}
              >
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${getStatusColors().dot}`}
                ></div>
                <span className="text-white/90 font-medium text-sm md:text-base tracking-wide">
                  {getStatusText()}
                </span>
              </div>

              {/* Porcupine Status Indicator */}
              {/* <div
                className={`flex items-center space-x-2 px-3 py-2 backdrop-blur-sm rounded-xl border transition-all duration-300 ${
                  isListening
                    ? "bg-green-500/10 border-green-400/30"
                    : error
                      ? "bg-red-500/10 border-red-400/30"
                      : "bg-gray-500/10 border-gray-400/30"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isListening
                      ? "bg-green-400 animate-pulse"
                      : error
                        ? "bg-red-400"
                        : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-white/70 font-medium text-xs">
                  {isListening ? "LISTENING" : error ? "ERROR" : "WAKE WORD"}
                </span>
              </div> */}
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(!isModalOpen)}
              className="group relative z-50 p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-105"
            >
              <Settings className="w-5 h-5 md:w-6 md:h-6 text-white/80 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 -mt-16">
          {/* Title Section */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light mb-4 md:mb-6">
              Hi, I'm{" "}
              <span className="font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Genie
              </span>
            </h1>
            <p className="text-white/60 text-sm md:text-base lg:text-lg">
              {isCallActive ? "Call in progress..." : "How can I help you today?"}
            </p>
          </div>

          {/* Enhanced Ripple Logo */}
          <div className="relative">
            {/* Main Logo Container */}
            <div
              className="relative flex items-center justify-center"
              style={{
                width: "min(50vw, 50vh, 400px)",
                height: "min(50vw, 50vh, 400px)",
              }}
            >
              {/* Outer Ripple Rings */}
              <div
                className={`absolute inset-0 rounded-full border animate-pulse ${
                  isCallActive ? "border-red-400/30" : "border-emerald-400/20"
                }`}
                style={{ animationDuration: isCallActive ? "1s" : "3s" }}
              ></div>
              <div
                className={`absolute rounded-full border animate-pulse ${
                  isCallActive ? "border-red-400/40" : "border-emerald-400/30"
                }`}
                style={{
                  animationDuration: isCallActive ? "1.2s" : "2.5s",
                  animationDelay: "0.5s",
                  top: "5%",
                  left: "5%",
                  right: "5%",
                  bottom: "5%",
                }}
              ></div>
              <div
                className={`absolute rounded-full border animate-pulse ${
                  isCallActive ? "border-red-400/35" : "border-teal-400/25"
                }`}
                style={{
                  animationDuration: isCallActive ? "1.5s" : "2s",
                  animationDelay: "1s",
                  top: "10%",
                  left: "10%",
                  right: "10%",
                  bottom: "10%",
                }}
              ></div>

              {/* Rotating Orbital Rings */}
              <div
                className={`absolute rounded-full border-2 border-transparent animate-spin ${
                  isCallActive
                    ? "border-t-red-400/50 border-r-red-500/40"
                    : "border-t-emerald-400/40 border-r-teal-400/30"
                }`}
                style={{
                  animationDuration: isCallActive ? "2s" : "8s",
                  top: "15%",
                  left: "15%",
                  right: "15%",
                  bottom: "15%",
                }}
              ></div>
              <div
                className={`absolute rounded-full border border-transparent animate-spin ${
                  isCallActive
                    ? "border-b-red-500/60 border-l-red-600/50"
                    : "border-b-emerald-500/50 border-l-teal-500/40"
                }`}
                style={{
                  animationDuration: isCallActive ? "1.5s" : "12s",
                  animationDirection: "reverse",
                  top: "20%",
                  left: "20%",
                  right: "20%",
                  bottom: "20%",
                }}
              ></div>

              {/* Inner Glow Ring */}
              <div
                className="absolute rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-white/10 shadow-inner"
                style={{
                  top: "25%",
                  left: "25%",
                  right: "25%",
                  bottom: "25%",
                }}
              ></div>

              {/* Center Core */}
              <button
                type="button"
                onClick={handleCallToggle}
                className={`relative rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 z-10 ${
                  isCallActive
                    ? "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/40 animate-pulse"
                    : "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/40 hover:shadow-emerald-500/60"
                }`}
                style={{
                  width: "30%",
                  height: "30%",
                }}
              >
                <div
                  className={`rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCallActive
                      ? "bg-gradient-to-br from-white/95 to-white/80"
                      : "bg-gradient-to-br from-white/95 to-white/80 animate-pulse"
                  }`}
                  style={{
                    animationDuration: isCallActive ? "none" : "4s",
                    width: "70%",
                    height: "70%",
                  }}
                >
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      isCallActive
                        ? "bg-gradient-to-br from-red-600 to-red-700"
                        : "bg-gradient-to-br from-emerald-600 to-teal-600"
                    }`}
                    style={{
                      width: "50%",
                      height: "50%",
                    }}
                  ></div>
                </div>

                {/* Call State Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`text-white font-bold text-xs transition-opacity duration-300 ${
                      isCallActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    ●
                  </div>
                </div>
              </button>

              {/* Floating Orbital Dots */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full animate-bounce"
                style={{
                  animationDelay: "0s",
                  animationDuration: "3s",
                  width: "3%",
                  height: "3%",
                }}
              ></div>
              <div
                className="absolute top-1/4 right-0 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full animate-bounce"
                style={{
                  animationDelay: "1s",
                  animationDuration: "3s",
                  width: "2.5%",
                  height: "2.5%",
                }}
              ></div>
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full animate-bounce"
                style={{
                  animationDelay: "2s",
                  animationDuration: "3s",
                  width: "3%",
                  height: "3%",
                }}
              ></div>
              <div
                className="absolute top-1/4 left-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full animate-bounce"
                style={{
                  animationDelay: "0.5s",
                  animationDuration: "3s",
                  width: "2.5%",
                  height: "2.5%",
                }}
              ></div>

              {/* Corner Accent Dots */}
              <div
                className="absolute bg-emerald-400/60 rounded-full animate-ping"
                style={{
                  animationDelay: "1.5s",
                  top: "5%",
                  right: "5%",
                  width: "1.5%",
                  height: "1.5%",
                }}
              ></div>
              <div
                className="absolute bg-teal-400/60 rounded-full animate-ping"
                style={{
                  animationDelay: "2.5s",
                  bottom: "5%",
                  left: "5%",
                  width: "1.5%",
                  height: "1.5%",
                }}
              ></div>
              <div
                className="absolute bg-green-400/80 rounded-full animate-ping"
                style={{
                  animationDelay: "0.8s",
                  top: "10%",
                  left: "10%",
                  width: "1%",
                  height: "1%",
                }}
              ></div>
              <div
                className="absolute bg-emerald-400/80 rounded-full animate-ping"
                style={{
                  animationDelay: "1.8s",
                  bottom: "10%",
                  right: "10%",
                  width: "1%",
                  height: "1%",
                }}
              ></div>
            </div>

            {/* Ambient Glow Effects */}
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/5 to-teal-500/5 blur-3xl scale-150 animate-pulse"
              style={{ animationDuration: "6s" }}
            ></div>
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/5 to-emerald-500/5 blur-2xl scale-125 animate-pulse"
              style={{ animationDuration: "4s", animationDelay: "1s" }}
            ></div>

            {/* Large Background Ripples */}
            <div
              className="absolute inset-0 scale-150 rounded-full border border-emerald-400/5 animate-ping"
              style={{ animationDuration: "5s" }}
            ></div>
            <div
              className="absolute inset-0 scale-200 rounded-full border border-teal-400/5 animate-ping"
              style={{ animationDuration: "7s", animationDelay: "2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
