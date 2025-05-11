
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface MessageData {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  date: Date;
  unread: boolean;
}

const messageData = [
  {
    id: '1',
    sender: {
      id: '101',
      name: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    content: 'Are we still on for the tennis match tomorrow?',
    date: new Date('2025-04-24T15:30:00'),
    unread: true,
  },
  {
    id: '2',
    sender: {
      id: '102',
      name: 'Mike Peters',
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
    content: 'Great game yesterday! We should play again soon.',
    date: new Date('2025-04-23T18:45:00'),
    unread: false,
  }
];

interface MessageListProps {
  onSelectConversation?: (message: MessageData) => void;
}

const MessageList = ({ onSelectConversation }: MessageListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredMessages = messageData.filter(message =>
    message.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center relative mb-4">
        <Search size={18} className="absolute left-3 text-muted-foreground" />
        <Input 
          placeholder="Search messages..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredMessages.map((message) => (
        <Card 
          key={message.id} 
          className="p-4 hover:bg-accent transition-colors cursor-pointer animate-fade-in"
          onClick={() => onSelectConversation && onSelectConversation(message)}
        >
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src={message.sender.avatar} />
              <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium">{message.sender.name}</h4>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(message.date)} ago
                </span>
              </div>
              <p className={`text-sm ${message.unread ? 'font-medium' : 'text-muted-foreground'}`}>
                {message.content}
              </p>
            </div>
            {message.unread && (
              <div className="w-2 h-2 rounded-full bg-scoresync-blue mt-2"></div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MessageList;
