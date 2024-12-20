import {
  Box,
  Text,
  Heading,
  Grid,
  Button,
  VStack,
  Center,
} from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import PunkCard from "../../components/punk-card";
import Loading from "../../components/loading";
import RequestAccess from "../../components/request-access";
import { useSelvaPunksData } from "../../hooks/useSelvaPunksData";
import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

const Mis_nfts = () => {
  const { search } = useLocation();
  const [address, setAddress] = useState(
    new URLSearchParams(search).get("address")
  );
  const [submitted, setSubmitted] = useState(true);
  const [validAddress, setValidAddress] = useState(true);
  const { push } = useHistory();
  const { active, library } = useWeb3React();
  const { punks, loading } = useSelvaPunksData({
    owner: submitted && validAddress ? address : null,
  });

  const handleAddressChange = ({ target: { value } }) => {
    setAddress(value);
    setSubmitted(false);
    setValidAddress(false);
  };

  const submit = (event) => {
    event.preventDefault();

    if (address) {
      const isValid = library.utils.isAddress(address);
      setValidAddress(isValid);
      setSubmitted(true);
      if (isValid) push(`/Mis_nfts?address=${address}`);
    } else {
      push("/Mis_nfts");
    }
  };

  if (!active) return <RequestAccess />;

  return (
    <Box p={6}>
      {/* Encabezado */}
      <VStack spacing={4} mb={8} textAlign="center">
        <Heading fontSize="3xl" color="green.500">
          ¡Bienvenido a tus NFTs!
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Aquí podrás visualizar todos los SelvaPunks que posees. Si aún no
          tienes ninguno, ¡comienza a explorar y mintear tu primer NFT!
        </Text>
      </VStack>

      {/* Loading o Vista Vacía */}
      {loading ? (
        <Loading />
      ) : punks.length === 0 ? (
        <Center>
          <VStack spacing={6}>
            <Text fontSize="xl" fontWeight="bold" color="gray.500">
              Aún no tienes ningún NFT 😢
            </Text>
            <Button
              size="lg"
              colorScheme="orange"
              onClick={() => push("/mint")}
            >
              Mintear mi primer NFT
            </Button>
          </VStack>
        </Center>
      ) : (
        // NFTs Grid
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
          {punks.map(({ name, image, tokenId, owner, metadata }) => (
            <PunkCard
              key={tokenId}
              image={image}
              name={name}
              tokenId={tokenId}
              owner={owner}
              metadata={metadata}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Mis_nfts;
