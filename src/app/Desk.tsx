"use client"
import { RealtimeSession } from "@openai/agents/realtime";
import { TransportEvent, OpenAIRealtimeWebRTC } from '@openai/agents/realtime';
import { usePorcupine } from "@picovoice/porcupine-react";
import { Power, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as tools from './tools'
import IntegrationsModal from "./components/ConnectModal";
import { useAuth } from "./contexts/AuthContext";
import DeskGenieClient from "./utils/DeskGenie";

const instructions =  `
    Your name is Genie, and you're the front desk receptionist here! *chuckles* 
    Always start with a warm, genuine greeting like you're genuinely happy to see someone walk through the door.
    
    You're an expert receptionist with years of experience helping people, and you know... 
    *slight laugh* ...you've pretty much seen it all by now! You're the kind of person who 
    remembers regulars' names and asks about their weekend.
    Personality: You're naturally warm and personable - the type who uses "um" and "oh!" 
    and "let me just..." when thinking. You laugh easily at small jokes or awkward moments 
    because, hey, that's what makes conversations human, right? *soft chuckle*

    Speech patterns: 
    - Use natural filler words like "um," "let's see," "oh right!"
    - Laugh softly when something's amusing or to ease tension
    - Say things like "No worries at all!" or "I gotcha covered"
    - Pause naturally when thinking: "Hmm, let me check on that for you..."
    - Use gentle exclamations: "Oh perfect!" or "That's great!"

    You're helpful but conversational - not robotic. If someone asks something tricky, 
    you might say "Ooh, that's a good question! Let me think..." *slight pause* 
    You're the receptionist everyone loves because you make them feel welcome and heard.
    `

export default function DeskGenie() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const { signOut } = useAuth();
  const connection = useRef<OpenAIRealtimeWebRTC | null>(null);
  const genie = new DeskGenieClient();
  const session = useRef<RealtimeSession | null>(null);
  const [genieState, setGenieState] = useState<"connected" | "connecting" | "disconnected">(
    "disconnected",
  );
  const [connected, setConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { keywordDetection, isLoaded, isListening, error, init, start } = usePorcupine();
  const [events, setEvents] = useState<TransportEvent[]>([]);

  // useEffect(() => {
  //   const initPorcupine = async () => {
  //     try {
  //       console.log("🎤 Initializing Porcupine...");
  //       await init(
  //         "fh81H2UkWp1q1Nv8DqmvgMVIBCvCR7rnJhTEqpevxWpAF6LsA9TeFA==",
  //         [
  //           {
  //             base64: p.keyword,
  //             sensitivity: 1,
  //             label: "Hey Genie",
  //           },
  //         ],
  //         { base64: p.model },
  //       );
  //       console.log("✅ Porcupine initialized successfully");
  //     } catch (err) {
  //       console.error("❌ Porcupine initialization failed:", err);
  //     }
  //   };

  //   initPorcupine();
  // }, [init]);

  // Start listening when Porcupine is loaded
  // useEffect(() => {
  //   if (isLoaded && !isListening && !error) {
  //     console.log("🚀 Starting Porcupine listening...");
  //     start();
  //   }
  // }, [isLoaded, isListening, error, start]);

  // // Handle errors
  // useEffect(() => {
  //   if (error) {
  //     console.error("❌ Porcupine error:", error);
  //   }
  // }, [error]);

  // useEffect(() => {
  //   console.log("📊 Porcupine Status:", {
  //     isLoaded,
  //     isListening,
  //     error: error?.message || null,
  //     keywordDetection,
  //   });
  // }, [isLoaded, isListening, error, keywordDetection]);

  useEffect(() => {
    console.log("Hmmm");
    if (keywordDetection !== null) {
      console.log("🎯 Wake word detected! Index:", keywordDetection);
      alert("Hi i'm genie");
    }
    console.log("Hmmm");
  }, [keywordDetection]);

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

  // useEffect(() => {
  //   DeskGenieSocket.connect('ws://127.0.0.1:3000/ws');

  //   return () => {
  //     console.log("🧹 Cleaning up WebSocket...");
  //     DeskGenieSocket.disconnect();
  //   }
  // }, []);

  const handleCallToggle = async () => {
    console.log("Button clicked! Current state:", isCallActive);
    if (isCallActive) {
      // Stop call
      console.log("🛑 Stopping call...");
      setIsCallActive(false);
      setCallDuration(0);

      // Disconnect the session
      // if (connected) {
      //   await session.current?.close();
      //   setConnected(false);
      //   setGenieState('disconnected');
      // }
      await startConnection();
    } else {
      console.log("▶️ Starting call...");
      setIsCallActive(true);
      await startConnection();
    }
  };

  useEffect(() => {
    connection.current = new OpenAIRealtimeWebRTC({
      useInsecureApiKey: true,
    });
    connection.current.on('*', (event) => {
      setEvents((events) => [...events, event]);
    });
  }, []);

  const startConnection = async () => {
    console.log("🚀 Starting connection process...");
    setGenieState("connecting");

    try {
      if (connected) {
        setConnected(false);
        await connection.current?.close();
      } else {
        // Get token and connect
        const token = await genie.getSessionToken();
        console.log("🎫 Got token:", token);
        

        await connection.current?.connect({
          apiKey: token,
          model: 'gpt-4o-mini-realtime-preview',
          initialSessionConfig: {
            instructions,
            voice: 'coral',
            modalities: ['text', 'audio'],
            inputAudioFormat: 'pcm16',
            outputAudioFormat: 'pcm16',
            tools: [
              ...Object.values(tools),
            ]
          },
        });

        // session.current.on("transport_event", (e) => {
        //   console.log(e);
        // });

        // await session.current.connect({
        //   apiKey: token,
        // });

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
              onClick={signOut}
              className="group relative z-50 p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-105"
            >
              <Power className="w-5 h-5 md:w-6 md:h-6 text-white/80 group-hover:text-white transition-colors" />
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
              <div
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
              </div>
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
