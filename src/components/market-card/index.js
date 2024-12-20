import {
  Box,
  Heading,
  Button,
  Stack,
  Text,
  Flex,
  Image,
  Tooltip,
} from "@chakra-ui/react";
import { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import useSelvaPunks from "../../hooks/useSelvaPunks";

const MarketCard = ({ image, name, tokenId, price, seller, metadata, ...props }) => {
  const { library, account } = useWeb3React();
  const selvaPunks = useSelvaPunks();
  const [isDelisting, setIsDelisting] = useState(false);

  const buy = async () => {
    try {
      await selvaPunks.methods.purchaseNFT(tokenId).send({
        from: account,
        value: price,
      });
      alert("¡Compra exitosa!");
    } catch (error) {
      console.error("Error al comprar el NFT:", error);
      alert("Ocurrió un error al realizar la compra.");
    }
  };

  const deslist = async () => {
    try {
      setIsDelisting(true);
      await selvaPunks.methods.delistNFT(tokenId).send({ from: account });
      alert("NFT deslistado con éxito.");
    } catch (error) {
      console.error("Error al deslistar el NFT:", error);
      alert("Hubo un error al intentar deslistar el NFT.");
    } finally {
      setIsDelisting(false);
    }
  };

  return (
    <Box
      p={6}
      maxW={"330px"}
      w={"full"}
      bg={"cyan.50"}
      boxShadow={"lg"}
      rounded={"lg"}
      overflow={"hidden"}
      _hover={{ boxShadow: "2xl", transform: "scale(1.05)" }}
      transition="all 0.3s ease"
      {...props}
    >
      <Box pos={"relative"}>
        <Image
          src={image}
          alt={name}
          rounded={"lg"}
          objectFit={"cover"}
          height={230}
          width={"full"}
        />
      </Box>
      <Stack pt={4} align={"center"}>
        <Heading fontSize={"xl"}>{name}</Heading>
        <Flex align="center" gap={2}>
          <Image src="/ethereum-icon.png" alt="Ethereum" boxSize="24px" />
          <Text fontSize="lg" fontWeight="bold">
            {library.utils.fromWei(price, "ether")} ETH
          </Text>
          
        </Flex>
        <Text fontWeight="bold">
          ${(((price/1e18)*3839.2).toFixed(2))} | S/{((price/1e18)*3.75*3839.2).toFixed(2)}  
          </Text>
        {seller !== account ? (
          <Button colorScheme="blue" onClick={buy} size="sm">
            Comprar
          </Button>
        ) : (
          <>
            <Text fontSize="large" color="blue.500" >
             <b> Eres el vendedor</b>
            </Text>
            <Button
              colorScheme="blue"
              onClick={deslist}
              size="sm"
              isLoading={isDelisting}
            >
              Deslistar
            </Button>
          </>
        )}

        {metadata?.attributes && (
          <Box mt={4} w="full">
            <Text fontWeight="semibold">Atributos:</Text>
            <Flex wrap="wrap" gap={2} mt={2}>
              {metadata.attributes.map((attr, index) => (
                <Tooltip
                  key={index}
                  label={
                    <Box  display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center">
                    <Image
                      src={`/atributos/${attr.value}.png`}
                      alt={attr.trait_type}
                      boxSize="50px"
                      mb={2}
                    />
                    <Text fontSize="sm" fontWeight="medium">
                    {attr.value}
                  </Text>
                  </Box>

                  }
                >
                  <Box
                    bg="blue.100"
                    px={3}
                    py={1}
                    rounded="md"
                    fontSize="sm"
                    fontWeight="medium"
                    textAlign="center"
                  >
                    {attr.trait_type}: {attr.value}
                  </Box>
                </Tooltip>
              ))}
            </Flex>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default MarketCard;
