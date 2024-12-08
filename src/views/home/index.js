import {
  Stack,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { Link } from "react-router-dom"; 
import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useState } from "react";
import useSelvaPunks from "../../hooks/useSelvaPunks";

const Home = () => {
  const [isMinting, setIsMinting] = useState(false);
  const { active } = useWeb3React();
  const [maxSupply, setMaxSupply] = useState();
  const selvaPunks = useSelvaPunks();
  const { account } = useWeb3React();
  const toast = useToast();
 

  const getMaxSupply = useCallback(async () => {
    if(selvaPunks){
      const result = await selvaPunks.methods.totalSupply().call();
      setMaxSupply(result);  
    }
  }, [selvaPunks]);

  useEffect(() => {
    getMaxSupply();
  }, [getMaxSupply]);

  if(!active) return "Conecta tu wallet";

  const mint = () => {
    setIsMinting(true);

    selvaPunks.methods.
      mint(1)
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

  return (
    <>
      <p>Existen: {maxSupply} SelvaPunks </p>
      <Stack
    align={"center"}
    spacing={{ base: 8, md: 10 }}
    py={{ base: 20, md: 28 }}
    direction={{ base: "column-reverse", md: "row" }}
  >
    <Stack flex={1} spacing={{ base: 5, md: 10 }}>
        <Heading
          lineHeight={1.1}
          fontWeight={600}
          fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
        >
        <Text
            as={"span"}
            position={"relative"}
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
          <Text as={"span"} color={"green.400"}>
            una forma de ayudar
          </Text>
          </Heading>
          <Text color={"gray.500"}>
          Selvapunks son NFTs que viven en la blockchain, y que a traves de su 
          comercialización permiten obtener fondos para salvar animales en peligro de extinción de la región Ucayali.
        </Text>
        <Stack
          spacing={{ base: 4, sm: 6 }}
          direction={{ base: "column", sm: "row" }}
        >  
        
    <Button
            rounded={"full"}
            size={"lg"}
            fontWeight={"normal"}
            px={6}
            colorScheme={"green"}
            bg={"green.400"}
            _hover={{ bg: "green.500" }}
            disabled={!selvaPunks}
            onClick={mint}
            isLoading={isMinting}
          >
            
            Obtén tu SelvaPunk
          </Button>
            <Button rounded={"full"}  size={"lg"} fontWeight={"normal"} px={6}>
              <a href="https://testnets.opensea.io/account">Galería</a>
            </Button>
          
          <Link to="/MarketSelvaPunks">
            <Button rounded={"full"} size={"lg"} colorScheme={"blue"}
            bg={"blue.400"} fontWeight={"normal"} px={6}>
              Marketplace
            </Button>
          </Link>
          </Stack>
          </Stack>
          <Flex
        flex={1}
        direction="column"
        justify={"center"}
        align={"center"}
        position={"relative"}
        w={"full"}
      >
        <iframe width="400" height="400" frameBorder="0" position={"absolute"} src={"https://imgflip.com/embed/62rl7o"} />
        <p font-size="20px"><b>¡Uno de estos SelvaPunks puede ser tuyo!</b></p>
      </Flex>
      
  </Stack> 
  
    </>

    
  );
};

export default Home;