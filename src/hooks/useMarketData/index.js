import { useCallback, useEffect, useState } from 'react';
import useSelvaPunks from '../useSelvaPunks';

const getPunkData = async ({ tokenId, selvaPunks }) => {
  const [tokenURI, owner] = await Promise.all([
    selvaPunks.methods.tokenURI(tokenId).call(),
    selvaPunks.methods.ownerOf(tokenId).call(),
  ]);

  const responseMetadata = await fetch(tokenURI);
  const metadata = await responseMetadata.json();

  return {
    tokenId,
    tokenURI,
    owner,
    ...metadata,
  };
};

const useMarketData = () => {
  const [punks, setPunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const selvaPunks = useSelvaPunks();

  const update = useCallback(async () => {
    if (selvaPunks) {
      setLoading(true);

      // Obtener todos los tokens mintados
      const totalMinted = await selvaPunks.methods.totalMinted().call();
      const punksPromise = [];

      // Iterar sobre los tokens mintados para verificar cuáles están listados
      for (let i = 0; i < totalMinted; i++) {
        const listing = await selvaPunks.methods.marketplaceListings(i).call();

        if (listing.isActive) {
          // Si el NFT está listado, obtener sus datos
          punksPromise.push(getPunkData({ tokenId: i, selvaPunks }));
        }
      }

      const punksData = await Promise.all(punksPromise);
      setPunks(punksData);
      setLoading(false);
    }
  }, [selvaPunks]);

  useEffect(() => {
    update();
  }, [update]);

  return {
    loading,
    punks,
    update,
  };
};

export { useMarketData };