import {
  Stack,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  Badge,
  useToast,
  Grid,
} from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import MarketCard from "../../components/market-card";
import Loading from "../../components/loading";
import RequestAccess from "../../components/request-access";
import { useMarketPlace } from "../../hooks/useMarketPlace";

const MarketSelvaPunks = () => {
  const { active, account } = useWeb3React();
  const { punks, loading } = useMarketPlace(); // Cambiamos a usar datos directamente del contrato

  if (!active) return <RequestAccess />;

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
          {punks
            .filter(({ isActive }) => isActive) // Mostrar solo NFTs listados como activos
            .map(({ name, image, tokenId, price, seller, metadata }) => (
              <MarketCard
                key={tokenId}
                image={image}
                name={name}
                tokenId={tokenId}
                price={price}
                seller={seller}
                metadata={metadata}
              />
            ))}
        </Grid>
      )}
    </>
  );
};

export default MarketSelvaPunks;