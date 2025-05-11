
import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import FriendSelector from './FriendSelector';

interface MessageComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MessageComposer = ({ open, onOpenChange }: MessageComposerProps) => {
  const [message, setMessage] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [step, setStep] = useState<'select' | 'compose'>('select');

  const handleSelectFriend = (friend: any) => {
    setSelectedFriend(friend);
    setStep('compose');
  };

  const handleSend = () => {
    if (message.trim() && selectedFriend) {
      // Here we would typically send the message
      console.log("Sending message:", message, "to:", selectedFriend.name);
      setMessage("");
      setSelectedFriend(null);
      setStep('select');
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedFriend(null);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {step === 'select' ? 'New Message' : `Message to ${selectedFriend?.name}`}
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4">
          {step === 'select' ? (
            <FriendSelector onSelectFriend={handleSelectFriend} />
          ) : (
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] mb-4"
            />
          )}
        </div>
        <DrawerFooter className="flex-row gap-2 justify-end">
          {step === 'compose' && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {step === 'compose' && (
            <Button 
              onClick={handleSend}
              className="bg-scoresync-blue hover:bg-scoresync-blue/90"
            >
              <Send size={16} className="mr-2" /> Send Message
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MessageComposer;
