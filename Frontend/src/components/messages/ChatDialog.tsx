
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from "lucide-react";
import { MessageData } from './MessageList';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: MessageData | null;
}

const ChatDialog = ({ open, onOpenChange, conversation }: ChatDialogProps) => {
  const [message, setMessage] = useState("");
  
  const handleSend = () => {
    if (message.trim()) {
      // Here we would typically send the message to an API
      console.log("Sending message:", message, "to:", conversation?.sender.name);
      setMessage("");
    }
  };
  
  if (!conversation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={conversation.sender.avatar} />
              <AvatarFallback>{conversation.sender.name[0]}</AvatarFallback>
            </Avatar>
            {conversation.sender.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[300px] mb-4">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-accent/20 rounded-md">
            <div className="flex justify-start">
              <div className="bg-accent p-3 rounded-lg max-w-[80%]">
                <p className="text-sm">{conversation.content}</p>
                <span className="text-xs text-muted-foreground">
                  {conversation.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-scoresync-blue text-white p-3 rounded-lg max-w-[80%]">
                <p className="text-sm">Thanks for the update!</p>
                <span className="text-xs text-white/70">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Textarea
            placeholder="Type your message..."
            className="min-h-[80px] resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button 
            className="h-full bg-scoresync-blue hover:bg-scoresync-blue/90" 
            onClick={handleSend}
          >
            <Send size={18} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
