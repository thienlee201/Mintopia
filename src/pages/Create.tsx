
import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { ethers } from "ethers";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const RPC_URL = import.meta.env.VITE_RPC_URL;
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

  const CONTRACT_ABI = [
    "function mintNFT(string memory tokenURI) public"
  ];

  const CREATORCHAIN_PARAMS = {
    chainId: "0x10469",
    chainName: "CreatorChain",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.creatorchain.io"],
    blockExplorerUrls: ["https://explorer.creatorchain.io"]
  };

  const switchToCreatorChain = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CREATORCHAIN_PARAMS.chainId }]
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [CREATORCHAIN_PARAMS]
        });
      } else {
        throw error;
      }
    }
  };

  const handleMint = async () => {
    if (!file || !name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide an image and name for your NFT",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const pinataMetadata = JSON.stringify({
        name: file.name,
      });
      formData.append("pinataMetadata", pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 1,
      });
      formData.append("pinataOptions", pinataOptions);
      console.log(PINATA_JWT);

      const imageUploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`
        },
        body: formData,
      });

      if (!imageUploadRes.ok) throw new Error("Failed to upload image");
      const { IpfsHash } = await imageUploadRes.json(); 

      try {
        const data = JSON.stringify({
          pinataContent: {
            name: name,
            description: description,
            image: "ipfs://" + IpfsHash
          },
          pinataMetadata: {
            name: "metadata.json"
          }
        })
        const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PINATA_JWT}`,
          },
          body: data,
        });
        if (!res.ok) throw new Error("Failed to upload metadata");
        const resData = await res.json();
        const Ipfs = resData.IpfsHash;

        await switchToCreatorChain();
        if (!window.ethereum) throw new Error("Metamask not detected!");

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const tx = await contract.mintNFT("ipfs://" + Ipfs);
        await tx.wait();

        toast({
          title: "NFT Minted Successfully",
          description: `Transaction: ${tx.hash}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
    setFile(null);
    setName('');
    setDescription('');
  };


  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Create NFT</h1>
          <p className="text-muted-foreground">Upload your art and mint as an NFT</p>
        </div>

        <div className="space-y-6">
          <ImageUpload onImageSelect={(file) => setFile(file)} />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter NFT name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your NFT (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleMint}
              className="w-full"
              disabled={isLoading || !file || !name.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting NFT...
                </>
              ) : (
                'Mint NFT'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
