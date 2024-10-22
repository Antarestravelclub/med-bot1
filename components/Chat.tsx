"use client";

import { useVoice } from "@humeai/voice-react";
import { Button } from "./ui/button";
import { Mic, MicOff, Phone } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Toggle } from "./ui/toggle";
import MicFFT from "./MicFFT";
import { cn } from "@/utils";
import { useHume } from "@/lib/useHume";
import { useState, useEffect } from "react";
import Expressions from "./Expressions";
import Messages from "./Messages";

export default function Chat({ accessToken }: { accessToken: string }) {
  const { disconnect, status, isMuted, unmute, mute, micFft } = useVoice();
  const { sendMessage, botResponse, emotions } = useHume(accessToken);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    if (botResponse) {
      setConversation((prev) => [
        ...prev,
        { role: "bot", content: botResponse, emotions },
      ]);
    }
  }, [botResponse, emotions]);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;
    setConversation((prev) => [...prev, { role: "user", content: input }]);
    try {
      await sendMessage(input);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-auto p-4">
        <div className="space-y-4">
          {conversation.map((message, index) => (
            <div key={index} className="p-4 rounded-lg bg-gray-100">
              <p className="font-bold">{message.role === 'user' ? 'You' : 'Bot'}:</p>
              <pre className="whitespace-pre-wrap break-words mt-2 max-h-[500px] overflow-y-auto">
                {message.content}
              </pre>
              {message.emotions && (
                <div className="mt-2 text-sm text-gray-600">
                  Emotions: {message.emotions.map(e => `${e.name} (${e.score.toFixed(2)})`).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="w-full p-2 border rounded"
        />
        <Button onClick={handleSendMessage} className="mt-2">
          Send
        </Button>
      </div>
      <div
        className={cn(
          "fixed bottom-0 left-0 w-full p-4 flex items-center justify-center",
          "bg-gradient-to-t from-card via-card/90 to-card/0"
        )}
      >
        <AnimatePresence>
          {status.value === "connected" ? (
            <motion.div
              initial={{
                y: "100%",
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: "100%",
                opacity: 0,
              }}
              className={
                "p-4 bg-card border border-border rounded-lg shadow-sm flex items-center gap-4"
              }
            >
              <Toggle
                pressed={!isMuted}
                onPressedChange={() => {
                  if (isMuted) {
                    unmute();
                  } else {
                    mute();
                  }
                }}
              >
                {isMuted ? (
                  <MicOff className={"size-4"} />
                ) : (
                  <Mic className={"size-4"} />
                )}
              </Toggle>

              <div className={"relative grid h-8 w-48 shrink grow-0"}>
                <MicFFT fft={micFft} className={"fill-current"} />
              </div>

              <Button
                size="icon"
                variant="destructive"
                onClick={() => disconnect()}
              >
                <Phone className={"size-4"} />
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
