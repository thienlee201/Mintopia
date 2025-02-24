
import { Link } from "react-router-dom";
import { Home, Plus, Image } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="mr-8 flex items-center space-x-2">
          <span className="text-xl font-bold">Mintopia</span>
        </Link>
        
        <div className="flex gap-6">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
          >
            <Home size={16} />
            Home
          </Link>
          <Link 
            to="/create" 
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
          >
            <Plus size={16} />
            Create
          </Link>
          <Link 
            to="/gallery" 
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
          >
            <Image size={16} />
            Gallery
          </Link>
        </div>
      </div>
    </nav>
  );
};
