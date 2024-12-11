import {
  Box,
  useColorModeValue,
  Heading,
  Button,
  Stack,
  Text,
  Flex,
  Image,
} from "@chakra-ui/react";
import { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import useSelvaPunks from "../../hooks/useSelvaPunks";

const MarketCard = ({ image, name, tokenId, price, seller, metadata, ...props }) => {
  const { library, account } = useWeb3React();
  const selvaPunks = useSelvaPunks();
  const [isDelisting, setIsDelisting] = useState(false);

  // Función para comprar un NFT del marketplace
  const buy = async () => {
    try {
      await selvaPunks.methods.purchaseNFT(tokenId).send({
        from: account,
        value: price, // El precio del NFT en wei
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
      role={"group"}
      p={6}
      maxW={"330px"}
      w={"full"}
      bg={useColorModeValue("cyan.50", "gray.800")}
      boxShadow={"2xl"}
      rounded={"lg"}
      pos={"relative"}
      zIndex={1}
      {...props}
    >
      <Box
        rounded={"lg"}
        pos={"relative"}
        height={"230px"}
        _after={{
          transition: "all .3s ease",
          content: '""',
          w: "full",
          h: "full",
          pos: "absolute",
          top: 0,
          left: 0,
          backgroundImage: `url(${image})`,
          filter: "blur(15px)",
          zIndex: -1,
        }}
        _groupHover={{
          _after: {
            filter: "blur(20px)",
          },
        }}
      >
        <Image
          rounded={"lg"}
          height={230}
          width={282}
          objectFit={"cover"}
          src={image}
        />
      </Box>
      <Stack pt={10} align={"center"}>
        <Heading fontSize={"xl"} fontFamily={"body"} fontWeight={500}>
          {name}
        </Heading>

        <Flex align="center">
        <Image 
    src="/ethereum-icon.png" 
    alt="Ethereum" 
    boxSize="30px" 
    // Espaciado a la derecha
  /> 

        <Heading fontSize={"xl"} fontFamily={"body"} fontWeight={500}> 
          {library.utils.fromWei(price, "ether")} eth
          
        </Heading>
        </Flex>
        {seller !== account ? ( // Mostrar botón de comprar solo si el usuario no es el vendedor
          <Button
            rounded={"full"}
            size={"lg"}
            fontWeight="bold"
            px={6}

            bg={"blue.100"}
            color={"blue.500"}
            onClick={buy}
          >
            Comprar
          </Button>
        ) : (
          <Heading align={"center"} fontSize={"lg"} color={"blue.500"}>
            Eres el vendedor
          <br></br>
            <Button
            
  rounded={"full"}
  size={"lg"}
  fontWeight="bold"
  textAlign={"center"}
  px={6}
  bg={"blue.100"}
  color={"blue.500"}
  onClick={deslist}
  isLoading={isDelisting} // Deshabilita el botón mientras está cargando
  mt={2}
>
  Deslistar
</Button>
          </Heading>
          
        )}
         {metadata?.attributes && (
          <Box>
            <Text fontWeight="semibold" mb={2}>Atributos:</Text>
            <Flex wrap="wrap" gap={2}>
              {metadata.attributes.map((attr, index) => (
                <Box 
                  key={index} 
                  bg="cyan.100" 
                  px={2} 
                  py={1} 
                  rounded="md"
                >
                  <Text fontSize="sm">
                    {attr.trait_type}: {attr.value}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default MarketCard;