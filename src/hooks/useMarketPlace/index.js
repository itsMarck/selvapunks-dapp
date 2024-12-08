import { useState, useEffect } from "react";
import useSelvaPunks from "../useSelvaPunks";

const useMarketPlace = () => {
  const [punks, setPunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const selvaPunks = useSelvaPunks();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const totalMinted = await selvaPunks.methods.totalMinted().call();
        const promises = [];

        // Iteramos sobre todos los NFTs minteados
        for (let i = 0; i < totalMinted; i++) {
          // Obtenemos el listado del NFT y la URI del token como promesas
          const listingPromise = selvaPunks.methods.marketplaceListings(i).call();
          const tokenURIPromise = selvaPunks.methods.tokenURI(i).call();
          
          // Solo agregamos la promesa si el NFT está listado (isActive es true)
          promises.push(
            listingPromise.then(listing => {
              if (listing.isActive) {
                // Si está activo, obtenemos los metadatos
                return tokenURIPromise.then(tokenURI => {
                  return fetch(tokenURI)
                    .then(response => response.json())
                    .then(metadata => ({
                      tokenId: i,
                      name: metadata.name || `SelvaPunk #${i}`,
                      image: metadata.image || `${tokenURI}.png`, // Agregamos el .png si no viene en los metadatos
                      price: listing.price,
                      isActive: listing.isActive,
                      seller: listing.seller,
                      metadata,
                    }));
                });
              }
              return null; // Si el NFT no está listado, no lo procesamos
            })
          );
        }

        // Resolvemos todas las promesas en paralelo
        const results = await Promise.all(promises);

        // Filtramos los valores nulos (aquellos que no están activos)
        setPunks(results.filter(punk => punk !== null));
      } catch (error) {
        console.error("Error fetching SelvaPunks data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selvaPunks]);

  return { punks, loading };
};


export { useMarketPlace} ;