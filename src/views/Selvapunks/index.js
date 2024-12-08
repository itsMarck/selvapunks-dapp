import {
  Box,
  InputGroup,
  InputLeftElement,
  Input,
  InputRightElement,
  Button,
  FormHelperText,
  FormControl,
  Heading,
  Grid,
  Text,
  Center,
  Badge,
  Stack,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useWeb3React } from "@web3-react/core";
import SelvapunkCard from "../../components/SelvapunkCard";
import Loading from "../../components/loading";
import RequestAccess from "../../components/request-access";
import { useSelvaPunksData } from "../../hooks/useSelvaPunksData";
import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

const CONTRACT_ADDRESS = "0xc130e91d6136da905d09a636ebb40ddd2b853ebe";

const Selvapunks = () => {
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
      if (isValid) push(`/Selvapunks?address=${address}`);
    } else {
      push("/Selvapunks");
    }
  };

  if (!active) return <RequestAccess />;

  return (
    <Box p={5}>
      <Heading textAlign="center" mb={4} color="teal.500">
        Bienvenido a Selvapunks
      </Heading>
      <Text textAlign="center" fontSize="lg" color="gray.600" mb={6}>
        Aquí encontrarás todos los Selvapunks en existencia y el dueño actual de cada uno.
      </Text>
      <form onSubmit={submit}>
        <FormControl>
          <InputGroup mb={5} maxW="600px" mx="auto">
            <InputLeftElement
              pointerEvents="none"
              children={<SearchIcon color="gray.300" />}
            />
            <Input
              value={address ?? ""}
              onChange={handleAddressChange}
              placeholder="Buscar por dirección"
              variant="filled"
              focusBorderColor="teal.400"
            />
            <InputRightElement width="5.5rem">
              <Button type="submit" colorScheme="teal" size="sm">
                Buscar
              </Button>
            </InputRightElement>
          </InputGroup>
          {submitted && !validAddress && (
            <FormHelperText color="red.400" textAlign="center">
              Dirección inválida. Por favor, verifica el formato.
            </FormHelperText>
          )}
        </FormControl>
      </form>
      {loading ? (
        <Center>
          <Loading />
        </Center>
      ) : punks.length > 0 ? (
        <Grid
          templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
          gap={6}
          mt={5}
        >
          {punks.map(({ name, image, tokenId, owner, metadata }) => (
            <SelvapunkCard
              key={tokenId}
              image={image}
              name={name}
              tokenId={tokenId}
              owner={
                owner.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
                  ? "Puesto en venta"
                  : owner
              }
              metadata={metadata}
              attributes={metadata.attributes}
            />
          ))}
        </Grid>
      ) : (
        <Center mt={10}>
          <Text fontSize="lg" color="gray.500">
            No se encontraron punks para esta dirección.
          </Text>
        </Center>
      )}
    </Box>
  );
};

export default Selvapunks;
