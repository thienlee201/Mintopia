import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye, X, Loader } from "lucide-react";

interface NFT {
  id: number;
  name: string;
  description: string;
  image: string;
  owner: string;
}

const RPC_URL = "https://rpc.creatorchain.io";
const CONTRACT_ADDRESS = "0xc8e3EEc851dFf273d1aA1a6EF71585e973004080";
const ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];
const formatAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const ipfsToHttp = (ipfsUrl: string) => {
  return ipfsUrl.startsWith("ipfs://")
    ? ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/")
    : ipfsUrl;
};

const Gallery = () => {
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const transferEvents = await contract.queryFilter("Transfer", 0, "latest");
        let fetchedNFTs: NFT[] = [];

        for (const event of transferEvents) {
          const tokenId = event.args.tokenId.toNumber();
          const owner = await contract.ownerOf(tokenId);
          const tokenURI = await contract.tokenURI(tokenId);

          const metadataUrl = ipfsToHttp(tokenURI);
          const metadata = await fetch(metadataUrl).then(res => res.json());

          fetchedNFTs.push({
            id: tokenId,
            name: metadata.name,
            description: metadata.description,
            image: ipfsToHttp(metadata.image),
            owner,
          });
        }

        setNfts(fetchedNFTs);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight">NFT Gallery</h1>
      <p className="text-muted-foreground">Discover the latest minted NFTs on Mintopia</p>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader className="animate-spin h-10 w-10 text-gray-500" />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {nfts.map((nft) => (
            <div key={nft.id} className="group relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{nft.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{nft.description?nft.description:"none!"}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Owner: 
                    <a
                    href={`https://explorer.creatorchain.io/address/${nft.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {formatAddress(nft.owner)}
                  </a>
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedNft(nft)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedNft} onOpenChange={() => setSelectedNft(null)}>
        <DialogContent className="max-w-[60vw] h-[90vh] overflow-y-auto">
          {selectedNft && (
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedNft.name}</h2>
                  <p className="text-sm text-muted-foreground">Owned by {selectedNft.owner}</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSelectedNft(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-6 flex-1 overflow-hidden rounded-lg">
                <img src={selectedNft.image} alt={selectedNft.name} className="h-full w-full object-cover" />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="mt-2 text-muted-foreground">{selectedNft.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
