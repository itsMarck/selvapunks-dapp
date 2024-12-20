import {
  Stack,
  Flex,
  Heading,
  Text,
  Button,
  Box,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link, useHistory } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useState } from "react";
import useSelvaPunks from "../../hooks/useSelvaPunks";
import Web3 from "web3";
const ethIcon = "/ethereum-icon.png"; // Ruta al ícono de Ethereum

const Home = () => {
  const [isMinting, setIsMinting] = useState(false);
  const { active, account } = useWeb3React();
  const [totalMinted, setTotalMinted] = useState(0);
  const [totalMarketplace, setTotalMarketplace] = useState(0);
  const [totalFunds, setTotalFunds] = useState(0);
  const [mintTransactionHash, setMintTransactionHash] = useState(null);
  const [newlyMintedNFT, setNewlyMintedNFT] = useState(null);
  const [showMintModal, setShowMintModal] = useState(false);
  const [mintLoadingDots, setMintLoadingDots] = useState('');
  const selvaPunks = useSelvaPunks();
  const toast = useToast();
  const history = useHistory();

  // Inicializar Web3 con el proveedor de Holesky
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      "https://holesky.infura.io/v3/1d7ef131825540328fa01ed61f5f7779"
    )
  );

  // Efecto para animar los puntos de carga durante el minteo
  useEffect(() => {
    let intervalId;
    if (isMinting) {
      intervalId = setInterval(() => {
        setMintLoadingDots(prev => 
          prev.length >= 3 ? '' : prev + '.'
        );
      }, 500);
    }
    return () => clearInterval(intervalId);
  }, [isMinting]);

  const getProjectStats = useCallback(async () => {
    if (selvaPunks) {
      const totalMintedCount = await selvaPunks.methods.totalMinted().call();
      setTotalMinted(totalMintedCount);

      // Obtener el número de SelvaPunks en el Marketplace
      let totalMarketplaceCount = 0;
      for (let i = 0; i < totalMintedCount; i++) {
        const listing = await selvaPunks.methods.marketplaceListings(i).call();
        if (listing.isActive) {
          totalMarketplaceCount++;
        }
      }
      setTotalMarketplace(totalMarketplaceCount);

      // Obtener el total de fondos recaudados
      const [balance] = await Promise.all([
        web3.eth.getBalance(
          "0xC130E91d6136dA905d09a636ebb40dDD2B853EbE"
        )
      ]);

      setTotalFunds(parseFloat(balance));
    }
  }, [selvaPunks, web3]);

  useEffect(() => {
    getProjectStats();
  }, [getProjectStats]);

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
        setMintTransactionHash(txHash);
        toast({
          title: "Transacción enviada",
          description: txHash,
          status: "info",
        });
      })
      .on("receipt", async (receipt) => {
        setIsMinting(false);
        getProjectStats(); // Actualizar las métricas después del minteo
        const tokenId = receipt.events.NFTMinted.returnValues.tokenId;
        const tokenURI = await selvaPunks.methods.tokenURI(tokenId).call();
        setNewlyMintedNFT({ tokenId, tokenURI });
        setShowMintModal(true);
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

  const totalFundsEth = totalFunds / 1e18;
  const totalFundsUsd = totalFundsEth * 3826.14;
  const totalFundsSoles = totalFundsUsd * 3.75;

  const navigateToMyNFTs = () => {
    history.push(`/mis_nfts?address=${account}`);
  };

  return (
    <>
      {/* Overlay oscuro durante el minteo */}
      {isMinting && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0,0,0,0.5)"
          zIndex="9999"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Box textAlign="center">
            <Image
              src="//i.imgflip.com/62rl7o.gif"
              alt="Minteando SelvaPunk"
              boxSize="150px"
              mb={4}
              ml={14}
              rounded="md"
            />
            <Text color="white" fontSize="2xl" align="center">
              Obteniendo tu SelvaPunk{mintLoadingDots}
            </Text>
          </Box>
        </Box>
      )}

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
            <StatGroup>
              <Stat>
                <StatLabel>SelvaPunks Minteados</StatLabel>
                <StatNumber>{totalMinted}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Incremento continuo
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>En Marketplace</StatLabel>
                <StatNumber>{totalMarketplace}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Ventas activas
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Fondos Recaudados</StatLabel>
                <StatNumber>
                  <Image
                    src={ethIcon}
                    alt="ETH"
                    display="inline-block"
                    w="1.5rem"
                  />
                  {totalFundsEth.toFixed(4)} ETH <Text fontSize="13">(S/.{totalFundsSoles.toFixed(2)})</Text>
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  En aumento
                </StatHelpText>
              </Stat>
            </StatGroup>
            <Stack
              spacing={4}
              direction="column"
              alignItems="center"
              width="100%"
              maxW="400px"
              mx="auto"
            >
              {/* Primera Línea */}
              <Stack
                direction={{ base: "column", sm: "row" }}
                spacing={4}
                width="100%"
              >
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

              {/* Segunda Línea */}
              <Stack
                direction={{ base: "column", sm: "row" }}
                spacing={4}
                width="100%"
              >
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
                <Link to="/Mis_nfts">
                <Button
                    rounded="full"
                    size="lg"
                    fontWeight="normal"
                    px={14}
                    bg="var(--chakra-colors-gray-200)"
                    _hover={{ bg: "var(--chakra-colors-gray-300)" }}
                    width={"auto"}
                    height={"45px"}
                  >
                  Mis NFTs
                </Button>
                </Link>
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
                    Recaudación de fondos
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

        {/* Animación de Minteo */}
        <Modal
          isOpen={showMintModal}
          onClose={() => {
            setShowMintModal(false);
            setMintTransactionHash(null);
          }}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader align="center">
            ¡Nuevo SelvaPunk Minteado!
              
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {newlyMintedNFT && (
                <>
                  <Image
                    src={`${newlyMintedNFT.tokenURI}.png`}
                    alt={`SelvaPunk #${newlyMintedNFT.tokenId}`}
                    borderRadius="md"
                    animation="fadeIn 0.5s ease-in-out"
                  />
                  <Text align="center"> <b>{newlyMintedNFT && `SelvaPunk #${newlyMintedNFT.tokenId}`} </b></Text>

                  {mintTransactionHash && (
                    <ChakraLink
                      href={`https://holesky.etherscan.io/tx/${mintTransactionHash}`}
                      isExternal
                      color="blue.500"
                      mt={4}
                      display="block"
                      textAlign="center"
                    >
                      Ver transacción en Etherscan
                    </ChakraLink>
                  )}
                </>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default Home;