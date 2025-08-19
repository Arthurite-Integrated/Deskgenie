import { CheckCircle, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import discord from "@/app/assets/discord.svg";
import calender from "@/app/assets/google.png";
import notion from "@/app/assets/notion.png";
import slack from "@/app/assets/slack.png";
import { requestGoogleCalenderAccess } from "../lib/auth-client";
import Image from "next/image";

export default function IntegrationsModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) {
  // const [isOpen, setIsOpen] = useState(true)
  const [connectedServices, setConnectedServices] = useState(new Set(["google-calendar"]));

  const services = [
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync your events and meetings seamlessly",
      icon: calender,
      gradient: "bg-black",
      hoverGradient: "hover:from-blue-600 hover:to-blue-700",
    },
    {
      id: "notion",
      name: "Notion",
      description: "Connect your workspace and databases",
      icon: notion,
      gradient: "bg-white",
      hoverGradient: "hover:from-gray-800 hover:to-black",
    },
    {
      id: "discord",
      name: "Discord",
      description: "Get notifications in your servers",
      icon: discord,
      gradient: "bg-black",
      hoverGradient: "hover:from-indigo-600 hover:to-purple-700",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Integrate with your team workspace",
      icon: slack,
      gradient: "bg-white",
      hoverGradient: "hover:from-purple-600 hover:to-pink-700",
    },
  ];

  const handleBackdropClick = (e: any) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in duration-300 scale-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 sm:px-6 py-6 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-600/20"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>

          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Connect Your Apps</h2>
              <p className="text-emerald-100 text-sm sm:text-base mt-2 font-medium">
                Integrate with your essential productivity tools
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Services List */}
        <div className="p-4 sm:p-6 space-y-4">
          {services.map((service) => {
            const isConnected = connectedServices.has(service.id);
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-emerald-200"
              >
                {/* Background gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 bg-gradient-to-r ${service.gradient} rounded-xl text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                    >
                      <Image alt='icons' src={Icon} className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors duration-200">
                        {service.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (service.id === "google-calendar") {
                        requestGoogleCalenderAccess();
                      }
                      setConnectedServices((prev) => {
                        const newSet = new Set(prev);
                        if (isConnected) {
                          newSet.delete(service.id);
                        } else {
                          newSet.add(service.id);
                        }
                        return newSet;
                      });
                    }}
                    className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 min-w-[120px] shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                      isConnected
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Connected</span>
                        <span className="sm:hidden">✓</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(services.length)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      i < connectedServices.size
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium ml-2">
                {connectedServices.size} of {services.length} connected
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
