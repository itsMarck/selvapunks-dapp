import {
  Box,
  useColorModeValue,
  Heading,
  Stack,
  Image,
  Text,
  Flex,
  VStack,
  HStack,
  Tooltip,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { useWeb3React } from "@web3-react/core";
import useSelvaPunks from "../../hooks/useSelvaPunks";
import { useState } from "react";

const SelvapunkCard = ({ image, name, tokenId, owner, metadata, ...props }) => {
  const selvaPunks = useSelvaPunks();
  const { account } = useWeb3React();
  const toast = useToast();
  const MarketAddress = "0x4a64Ba2144687896bcc8aBA429CF8c96a5a2B952";

  // Función para acortar direcciones
  const shortenAddress = (address) => {
    return address
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : "";
  };

  // Función para copiar la dirección al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Dirección copiada",
        description: "La dirección del dueño se copió al portapapeles.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    });
  };

  // Analizar rareza basado en atributos
  const calculateRarity = () => {
    if (!metadata?.attributes) return "Común";

    const rarenessScore = metadata.attributes.reduce((score, attr) => {
      switch (attr.trait_type) {
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

    if (rarenessScore > 10) return "Legendario";
    if (rarenessScore > 7) return "Épico";
    if (rarenessScore > 4) return "Único";
    return "Común";
  };

  const rarity = calculateRarity();

  return (
    <Box
      role={"group"}
      p={6}
      maxW={"330px"}
      w={"full"}
      bg={useColorModeValue("white", "gray.800")}
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
            filter: "blur(25px)",
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
              rarity === "Legendario"
                ? "purple.500"
                : rarity === "Épico"
                ? "orange.500"
                : rarity === "Único"
                ? "yellow.500"
                : "gray.500"
            }
          >
            {rarity}
          </Text>
        </Flex>

        <HStack spacing={2}>
          <Text fontWeight="semibold">Dueño:</Text>
          <Tooltip label={owner}>
            <Flex alignItems="center">
              <Text mr={2} color="green.600" fontWeight="bold">
                {shortenAddress(owner)}
              </Text>
              <CopyIcon
                cursor="pointer"
                onClick={() => copyToClipboard(owner)}
                color="green.500"
                _hover={{ color: "green.700" }}
              />
            </Flex>
          </Tooltip>
        </HStack>

        {metadata?.attributes && (
          <Box>
            <Text fontWeight="semibold" mb={2}>
              Atributos:
            </Text>
            <Flex wrap="wrap" gap={2}>
              {metadata.attributes.map((attr, index) => (
                <Badge
                  key={index}
                  px={2}
                  py={1}
                  borderRadius="full"
                  colorScheme="teal"
                  fontSize="xs"
                >
                  {attr.trait_type}: {attr.value}
                </Badge>
              ))}
            </Flex>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default SelvapunkCard;
