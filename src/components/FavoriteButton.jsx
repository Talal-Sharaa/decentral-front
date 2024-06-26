import React, { useState, useEffect } from "react";
import { getContract, getProvider } from "../utils/Web3Utils.js";
import ContractABI from "../utils/NewsPlatform.json";
import { Button, CircularProgress } from "@mui/material";
import { useContract } from "../utils/ContractContext";

const FavoriteButton = ({ articleId }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const contractAddress = useContract();

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const provider = await getProvider();
        setProvider(provider);

        const signer = await provider.getSigner();
        const contract = getContract(
          ContractABI.abi,
          contractAddress,
          signer
        );
        setContract(contract);

        const accounts = await signer.getAddress();
        const favorites = await contract.getFavorites();
        const isFavorite = favorites.some((fav) => fav.id === articleId); // Assuming 'id' property exists in ArticleWithID
        setIsFavorited(isFavorite);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [articleId, isFavorited]);

  const handleFavoriteClick = async () => {
    setIsLoadingFavorite(true);
    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = isFavorited
        ? await contractWithSigner.removeFromFavorites(articleId)
        : await contractWithSigner.addToFavorites(articleId);

      await tx.wait();
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      // Handle the error with a user-friendly message
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleFavoriteClick}
      disabled={isLoadingFavorite}
    >
      {isLoadingFavorite ? (
        <CircularProgress size="small" />
      ) : isFavorited ? (
        "Favorited!"
      ) : (
        "Add to Favorites"
      )}
    </Button>
  );
};

export default FavoriteButton;
