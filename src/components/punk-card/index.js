import {
  Box,
  useColorModeValue,
  Heading,
  Button,
  Stack,
  Image,
  Text,
  Flex,
  VStack,
  HStack,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import useSelvaPunks from "../../hooks/useSelvaPunks";
import { useState } from "react";
import { CopyIcon } from "@chakra-ui/icons";
import Loading from "../../components/loading";

const PunkCard = ({ image, name, tokenId, owner, metadata, ...props }) => {
  const selvaPunks = useSelvaPunks();

  const { account } = useWeb3React();
  const { library } = useWeb3React();
  const MarketAddress = "0x4a64Ba2144687896bcc8aBA429CF8c96a5a2B952";
  const toast = useToast();
  const [transfering, setTransfering] = useState(false);


  
 // Function to shorten address
 const shortenAddress = (address) => {
  return address 
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';
};

// Function to copy address to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    toast({
      title: "Address Copied",
      description: "Owner's address copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  });
};

// Analyze rarity based on attributes
const calculateRarity = () => {
  if (!metadata?.attributes) return "Common";
  
  const rarenessScore = metadata.attributes.reduce((score, attr) => {
    // Example rarity calculation logic
    switch(attr.trait_type) {
      case "Background":
        return score + (attr.rarity ? 2 : 1);
      case "Skin":
        return score + (attr.rarity ? 3 : 1);
      case "Accessories":
        return score + (attr.rarity ? 4 : 1);
      default:
        return score + 1;
    }
  }, 0);

  if (rarenessScore > 10) return "Legendary";
  if (rarenessScore > 7) return "Epic";
  if (rarenessScore > 4) return "Rare";
  return "Common";
};








  const approve = () => {
    
    selvaPunks.methods.approve(MarketAddress, tokenId)
    .send({
      from: account
    })
  };

  const vender = () => {
    setTransfering(true);
    const exa = 1000000000000000000; // 1 ETH en wei
    let precio = prompt("Ingresa el precio de venta de su SelvaPunk (en ETH):");

    // Convertir precio a wei (BigNumber)
    try {
        const precioWei = library.utils.toWei(precio, "ether");

        selvaPunks.methods
            .listNFT(tokenId, precioWei) // Usamos el método listNFT del contrato actualizado
            .send({
                from: account,
            })
            .on("error", () => {
                setTransfering(false);
                toast({
                    title: "Error en la transacción",
                    description: "Algo salió mal. Intenta de nuevo.",
                    status: "error",
                });
            })
            .on("transactionHash", (txHash) => {
                toast({
                    title: "Transacción enviada",
                    description: `Hash: ${txHash}`,
                    status: "info",
                });
            })
            .on("receipt", () => {
                setTransfering(false);
                toast({
                    title: "NFT listado",
                    description: "El SelvaPunk se ha listado correctamente en el Marketplace.",
                    status: "success",
                });
                window.location.reload();
            });
    } catch (error) {
        setTransfering(false);
        toast({
            title: "Precio inválido",
            description: "Por favor, ingresa un número válido.",
            status: "error",
        });
    }
  };

  const rarity = calculateRarity();

  return (
    <Box
      role={"group"}
      p={6}
      maxW={"330px"}
      w={"full"}
      bg={useColorModeValue("green.50", "gray.800")}
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
      <VStack spacing={4} align="stretch" pt={4}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading fontSize={"xl"} fontFamily={"body"} fontWeight={500}>
            {name}
          </Heading>
          <Text 
            fontWeight="bold" 
            color={
              rarity === "Legendary" ? "purple.500" : 
              rarity === "Epic" ? "orange.500" : 
              rarity === "Rare" ? "orange.500" : 
              "gray.500"
            }
          >
            {rarity}
          </Text>
        </Flex>

        <HStack spacing={2}>
          <Text fontWeight="semibold">Dueño:</Text>
          <Tooltip label={owner}>
            <Flex alignItems="center">
              <Text mr={2} rounded="lg" fontWeight="bold" color="green.500" fontSize={"lg"} >Tú</Text>
              <CopyIcon 
                cursor="pointer" 
                onClick={() => copyToClipboard(owner)}
                color="green.500"
              />
            </Flex>
          </Tooltip>
        </HStack>

        {metadata?.attributes && (
          <Box>
            <Text fontWeight="semibold" mb={2}>Atributos:</Text>
            <Flex wrap="wrap" gap={2}>
              {metadata.attributes.map((attr, index) => (
                <Box 
                  key={index} 
                  bg="green.100" 
                  px={2} 
                  py={1} 
                  rounded="md"
                >
                  <Text fontSize="sm" 
                  fontWeight="medium">
                    {attr.trait_type}: {attr.value}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>
        )}

        <HStack spacing={4} pt={4}>
          
          <Button 
            rounded={"full"} 
            size={"lg"}
            color="white"
            px={6} 
            onClick={vender} 
            isLoading={transfering}
            w="full"
            fontSize={"lg"}
            bg={"green.500"}
            fontWeight="bold"
          >
            Vender
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default PunkCard;
