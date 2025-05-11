import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Trophy, Users, Calendar, MessageSquare } from 'lucide-react';
import NotificationsPopover from '../notifications/NotificationsPopover';

interface NavbarProps {
  notifications?: {
    incoming?: {
      id: number;
      from_user: {
        full_name: string;
        username: string;
        profile_picture: string;
      };
      created_at: string;
    }[];
    accepted?: {
      id: number;
      to_user: {
        full_name: string;
        username: string;
        profile_picture: string;
      };
      created_at: string;
    }[];
  };
}

const Navbar: React.FC<NavbarProps> = ({ notifications = {} }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-scoresync-border z-50 px-4">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/dashboard" className="font-bold text-xl text-scoresync-black">
            Score<span className="text-scoresync-blue">Sync</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/scores" className={`nav-link ${location.pathname === '/scores' ? 'active' : ''}`}>
            <Trophy size={20} />
            <span>Scores</span>
          </Link>
          <Link to="/friends" className={`nav-link ${location.pathname === '/friends' ? 'active' : ''}`}>
            <Users size={20} />
            <span>Friends</span>
          </Link>
          <Link to="/challenges" className={`nav-link ${location.pathname === '/challenges' ? 'active' : ''}`}>
            <Calendar size={20} />
            <span>Challenges</span>
          </Link>
          <Link to="/messages" className={`nav-link ${location.pathname === '/messages' ? 'active' : ''}`}>
            <MessageSquare size={20} />
            <span>Messages</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <NotificationsPopover notifications={notifications} />

          <Avatar 
            className="h-9 w-9 hover:avatar-ring cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
