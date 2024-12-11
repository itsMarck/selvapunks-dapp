import {
  Stack,
  Flex,
  Heading,
  Text,
  Button,
  Box,
  useToast,
} from "@chakra-ui/react";
import { Link, useHistory } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useState } from "react";
import useSelvaPunks from "../../hooks/useSelvaPunks";

const Home = () => {
  const [isMinting, setIsMinting] = useState(false);
  const { active, account } = useWeb3React();
  const [maxSupply, setMaxSupply] = useState();
  const selvaPunks = useSelvaPunks();
  const toast = useToast();
  const history = useHistory();

  const getMaxSupply = useCallback(async () => {
    if (selvaPunks) {
      const result = await selvaPunks.methods.totalSupply().call();
      setMaxSupply(result);
    }
  }, [selvaPunks]);

  useEffect(() => {
    getMaxSupply();
  }, [getMaxSupply]);

  if (!active) return "Conecta tu wallet";

  const mint = () => {
    setIsMinting(true);

    selvaPunks.methods
      .mint(1)
      .send({
        from: account,
        value: 0.001e18,
      })
      .on("transactionHash", (txHash) => {
        toast({
          title: "Transacción enviada",
          description: txHash,
          status: "info",
        });
      })
      .on("receipt", () => {
        setIsMinting(false);
        toast({
          title: "Transacción confirmada",
          description: "¡Felicidades! Ahora eres dueño de un nuevo SelvaPunk.",
          status: "success",
        });
      })
      .on("error", (error) => {
        setIsMinting(false);
        toast({
          title: "Transacción fallida",
          description: error.message,
          status: "error",
        });
      });
  };

  const navigateToMyNFTs = () => {
    history.push(`/mis_nfts?address=${account}`);
  };

  return (
    <Box maxW="1200px" mx="auto" px={4} py={6}>
      <Stack
        align="center"
        spacing={{ base: 8, md: 10 }}
        py={{ base: 12, md: 20 }}
        direction={{ base: "column-reverse", md: "row" }}
      >
        <Stack flex={1} spacing={{ base: 5, md: 8 }}>
          <Heading
            lineHeight={1.1}
            fontWeight={600}
            fontSize={{ base: "3xl", sm: "4xl", lg: "5xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            <Text
              as="span"
              position="relative"
              _after={{
                content: "''",
                width: "full",
                height: "30%",
                position: "absolute",
                bottom: 1,
                left: 0,
                bg: "green.400",
                zIndex: -1,
              }}
            >
              Un SelvaPunk
            </Text>
            <br />
            <Text as="span" color="green.400">
              una forma de ayudar
            </Text>
          </Heading>
          <Text
            color="gray.500"
            fontSize={{ base: "sm", md: "md" }}
            textAlign={{ base: "center", md: "left" }}
          >
            Selvapunks son NFTs que viven en la blockchain y que, a través de
            su comercialización, permiten obtener fondos para salvar animales
            en peligro de extinción de la región Ucayali.
          </Text>
          <Stack
            spacing={4}
            direction="column"
            alignItems="center"
            width="100%"
            maxW="400px"
            mx="auto"
          >
            {/* First Line */}
            <Stack direction={{ base: "column", sm: "row" }} spacing={4} width="100%">
              <Button
                rounded="full"
                size="lg"
                fontWeight="normal"
                px={6}
                colorScheme="green"
                bg="green.400"
                _hover={{ bg: "green.500" }}
                disabled={!selvaPunks}
                onClick={mint}
                isLoading={isMinting}
                width="100%"
              >
                Obtén tu SelvaPunk
              </Button>
              <Link to="/MarketSelvaPunks">
                <Button
                  rounded="full"
                  size="lg"
                  colorScheme="blue"
                  bg="blue.400"
                  fontWeight="normal"
                  px={6}
                  width="100%"
                >
                  Marketplace
                </Button>
              </Link>
            </Stack>

            {/* Second Line */}
            <Stack direction={{ base: "column", sm: "row" }} spacing={4} width="100%">
              <Link to="/Selvapunks">
                <Button
                  rounded="full"
                  size="lg"
                  fontWeight="normal"
                  px={6}
                  bg="var(--chakra-colors-gray-200)"
                  _hover={{ bg: "var(--chakra-colors-gray-300)" }}
                  width="100%"
                >
                  Galería
                </Button>
              </Link>
              <Button
                rounded="full"
                size="lg"
                fontWeight="normal"
                px={6}
                bg="var(--chakra-colors-gray-200)"
                _hover={{ bg: "var(--chakra-colors-gray-300)" }}
                width="100%"
                onClick={navigateToMyNFTs}
              >
                Mis NFTs
              </Button>
              <Link to="/Financiamiento">
                <Button
                  rounded="full"
                  size="lg"
                  fontWeight="normal"
                  px={6}
                  bg="var(--chakra-colors-gray-200)"
                  _hover={{ bg: "var(--chakra-colors-gray-300)" }}
                  width="100%"
                >
                  Financiamiento
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Stack>
        <Flex
          flex={1}
          justify="center"
          align="center"
          w="full"
          maxW="400px"
          mx={{ base: "auto", md: "0" }}
        >
          <Box
            as="iframe"
            src="https://imgflip.com/embed/62rl7o"
            width="100%"
            height="100%"
            maxW="400px"
            borderRadius="md"
            allowFullScreen
            style={{ aspectRatio: "1/1" }}
          />
        </Flex>
      </Stack>
    </Box>
  );
};

export default Home;
