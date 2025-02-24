
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="min-h-screen">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-20 md:py-32">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Create and Mint Your NFTs
            <br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              on Mintopia
            </span>
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Transform your digital art into unique NFTs. Simple, fast, and secure minting on the Creator blockchain.
          </p>
        </div>

        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link to="/create">
              Start Creating
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/gallery">
              View Gallery
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg bg-muted/50"
            >
              <div className="rounded-full bg-primary/10 p-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    title: "Easy Minting",
    description: "Upload your art and mint NFTs in just a few clicks",
    icon: <Plus className="h-6 w-6 text-primary" />,
  },
  {
    title: "Secure Storage",
    description: "Your NFTs are safely stored on the blockchain",
    icon: <Image className="h-6 w-6 text-primary" />,
  },
  {
    title: "Showcase Gallery",
    description: "Display your NFT collection in our beautiful gallery",
    icon: <ArrowRight className="h-6 w-6 text-primary" />,
  },
];

export default Home;
