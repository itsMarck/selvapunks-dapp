import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  useToast,
  Tooltip,
  Image,
} from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import Web3 from "web3";
import { useEffect, useState, useCallback } from "react";
import RequestAccess from "../../components/request-access";
import useSelvaPunks from "../../hooks/useSelvaPunks";

// Inicializar Web3 con el proveedor de Holesky
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://holesky.infura.io/v3/1d7ef131825540328fa01ed61f5f7779"
  )
);

const ethIcon = "/ethereum-icon.png"; // Ruta al ícono de Ethereum

const Financiamiento = () => {
  const { active, account } = useWeb3React();
  const selvaPunks = useSelvaPunks();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [mintRevenue, setMintRevenue] = useState(0);
  const [salesRevenue, setSalesRevenue] = useState(0);
  const [lastWithdrawlTotal, setLastWithdrawlTotal] = useState(0);
  const [totalFunds, setTotalFunds] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [recentMints, setRecentMints] = useState([]); 
  const [recentSales, setRecentSales] = useState([]); 
  const [lastWithdrawals, setLastWithdrawals] = useState([]);
  const [organizationWallet, setOrganizationWallet] = useState("");
  const [lastMintRetirado, setLastMintRetirado] = useState(0);
  const [lastSalesRetirado, setLastSalesRetirado] = useState(0);
  
  const usdToPenRate = 3.75;
  const deploymentBlock = 2873541;

  // Obtener datos del contrato
  const fetchContractData = useCallback(async () => {
    if (selvaPunks) {
      try {
        // Obtener balance y precio del ETH en USD
        const [balance, ethPriceData] = await Promise.all([
          web3.eth.getBalance(
            "0xC130E91d6136dA905d09a636ebb40dDD2B853EbE"
          ),
          fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
          )
            .then((res) => res.json())
            .then((data) => data.ethereum.usd),
        ]);
  
        setTotalFunds(parseFloat(balance));
        setEthPrice(ethPriceData);
  
        //OBTENER LO RECAUDADO POR MINTEOS Y COMPRAS DEL ANTERIOR MES
        const [mintRevenueRetirado, salesRevenueRetirado] = await Promise.all([
          selvaPunks.methods.getMintRevenueRetirado().call(),
          selvaPunks.methods.getSalesRevenueRetirado().call(),
         
        ]);

        setLastMintRetirado(parseFloat(mintRevenueRetirado) / 1e18);
        setLastSalesRetirado(parseFloat(salesRevenueRetirado) / 1e18);
        






        // Obtener los eventos de NFT mint y compra
        const [mintEvents, purchaseEvents] = await Promise.all([
          selvaPunks.getPastEvents("NFTMinted", {
            fromBlock: deploymentBlock,
            toBlock: "latest",
          }),
          selvaPunks.getPastEvents("NFTPurchased", {
            fromBlock: deploymentBlock,
            toBlock: "latest",
          }),
        ]);
  
        // Mostrar los últimos 5 NFTs minteados
        setRecentMints(
          mintEvents.slice(-5).map((event) => ({
            tokenId: event.returnValues.tokenId,
            minter: event.returnValues.minter,
            tokenURI: event.returnValues.tokenURI,
            txHash: event.transactionHash, // Añadido para el enlace
          }))
        );
  
        // Mostrar los últimos 5 NFTs vendidos
        const sales = purchaseEvents.slice(-5).map((event) => ({
          tokenId: event.returnValues.tokenId,
          buyer: event.returnValues.buyer,
          seller: event.returnValues.seller,
          price: parseFloat(event.returnValues.price) / 1e18,
          tokenURI: event.returnValues.tokenURI,
          txHash: event.transactionHash, // Añadido para el enlace
        }));
        setRecentSales(sales);
  
        // calculo de los balances
        const [mintRevenueBeforeLastWithdrawal, salesRevenueBeforeLastWithdrawal, lastWithdrawalTotal] = await Promise.all([
          selvaPunks.methods.getMintRevenueBeforeLastWithdrawal().call(),
          selvaPunks.methods.getSalesRevenueBeforeLastWithdrawal().call(),
          selvaPunks.methods.getLastWithdrawalTotal().call(),
        ]);

        setMintRevenue(parseFloat(mintRevenueBeforeLastWithdrawal) / 1e18);
        setSalesRevenue(parseFloat(salesRevenueBeforeLastWithdrawal) / 1e18);
        setLastWithdrawlTotal(parseFloat(lastWithdrawalTotal) / 1e18);
  
        // Obtener datos de los retiros realizados
        const withdrawalEvents = await selvaPunks.getPastEvents(
          "FundsWithdrawn",
          {
            fromBlock: deploymentBlock,
            toBlock: "latest",
          }
        );
        setLastWithdrawals(
          withdrawalEvents.map((event) => ({
            amount: parseFloat(event.returnValues.amount) / 1e18,
            timestamp: parseInt(event.returnValues.timestamp, 10),
            txHash: event.transactionHash,
          }))
        );
  
        // Obtener la wallet de la organización
        const wallet = await selvaPunks.methods.ORGANIZATION_WALLET().call();
        setOrganizationWallet(wallet);
  
       
      

      } catch (error) {
        console.error("Error fetching contract data:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [selvaPunks]);

  const fetchEthPrice = useCallback(async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await response.json();
      setEthPrice(data.ethereum.usd);
    } catch (error) {
      console.error("Error fetching Ethereum price:", error);
    }
  }, []);

  useEffect(() => {
    if (active) {
      fetchEthPrice();
      fetchContractData();
    }
  }, [active, fetchEthPrice, fetchContractData]);

  const handleWithdrawFunds = async () => {
    if (account !== organizationWallet) {
      toast({
        title: "Acceso denegado",
        description: "Solo la cuenta de la organización puede retirar fondos.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await selvaPunks.methods.withdrawFunds().send({ from: account });
      toast({
        title: "Fondos retirados",
        description: "Los fondos han sido transferidos con éxito.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchContractData();
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al intentar retirar los fondos.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const shortenAddress = (address) =>
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  if (!active) return <RequestAccess />;
  if (loading) return <Spinner size="xl" />;

  const totalFundsEth = totalFunds / 1e18;
  const totalFundsUsd = totalFundsEth * ethPrice;
  const totalFundsSoles = totalFundsUsd * usdToPenRate;


  return (
    <Flex direction="column" p={6}>
      <Heading mb={4}>Recaudación de fondos</Heading>

      {/* Mostrar el valor de Ethereum en tiempo real */}
      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4} mb={6}>
      <Box
  p={4}
  border="1px solid #ccc"
  borderRadius="md"
  backgroundImage={`url(${ethIcon})`}
  backgroundRepeat="no-repeat"
  backgroundPosition="right"
  backgroundSize="100px"
>
  <Heading size="md">1 Ethereum (ETH)</Heading>
  <Text fontSize="lg" mb={2}>
    <b>{ethPrice} USD</b>
  </Text>
  <Text fontSize="sm">Convertido a S/.: S/ {(ethPrice * usdToPenRate).toFixed(2)}</Text>
</Box>
        <Box p={4} border="1px solid #ccc" borderRadius="md">
          <Heading size="md">Balance de este mes</Heading>
          <Text fontSize="lg" mb={2}>
            Total recaudado:{" "}
            <Image src={ethIcon} alt="ETH" display="inline-block" w="1rem" />
            <b>
              {totalFundsEth.toFixed(4)} ETH
              
            </b>{" "}
            (${totalFundsUsd.toFixed(2)} | S/.{totalFundsSoles.toFixed(2)})
          </Text>
          <Text>
        Minteo de NFTs: <b>{mintRevenue.toFixed(4)} ETH</b>
      </Text>
      <Text>
        Compras en el Marketplace: <b>{salesRevenue.toFixed(4)} ETH</b>
      </Text>
        </Box> 
      </Box>

      {/* Fondos del mes anterior */}
      <Box p={4} border="1px solid #ccc" borderRadius="md">
        <Heading size="md">Fondos del mes anterior</Heading>
        <Text>
          Total recaudado: <b>{lastWithdrawlTotal.toFixed(4)} ETH</b>
        </Text>
        <Text>
          Minteo de NFTs: <b>{lastMintRetirado.toFixed(4)} ETH</b>
        </Text>
        <Text>
          Compras en el Marketplace: <b>{lastSalesRetirado.toFixed(4)}</b>
          <b>{} ETH</b>
        </Text>
        
      </Box>
      
      <br />
      {/* Mostrar los últimos 5 NFTs minteados */}
      <Heading size="md" mb={4}>Últimos 5 NFTs Mintados:</Heading>
      <Flex direction="row" gap={4} flexWrap="wrap">
        {recentMints.map((mint, index) => (
          <Box key={index} p={3} border="1px solid #ccc" borderRadius="md" mb={4} width="200px">
            <Image
              src={mint.tokenURI + ".png"}
              alt={`NFT #${mint.tokenId}`}
              boxSize="100px"
              borderRadius="md"
              mb={2}
            />
            <Text fontWeight="bold">SelvaPunk #{mint.tokenId}</Text>
            <Text>
              Minteado por{" "}
              <Tooltip label={mint.minter}>
                <Button variant="link" size="sm">
                  {shortenAddress(mint.minter)}
                </Button>
              </Tooltip>
            </Text>
            <Text>
              Recaudado por minteo:{" "}
              <Image src={ethIcon} alt="ETH" display="inline-block" w="1rem" />
              <b>0.001 ETH</b> (S/.{(0.001 * ethPrice * usdToPenRate).toFixed(2)})
            </Text>
            <Text>
              <a href={`https://holesky.etherscan.io/tx/${mint.txHash}`} target="_blank" rel="noopener noreferrer">Ver transacción</a>
            </Text>
          </Box>
        ))}
      </Flex>

      {/* Mostrar las últimas 5 ventas */}
      <Heading size="md" mb={4}>Últimas 5 Ventas:</Heading>
      <Flex direction="row" gap={4} flexWrap="wrap">
        {recentSales.map((sale, index) => (
          <Box key={index} p={3} border="1px solid #ccc" borderRadius="md" mb={4} width="200px">
            <Image
              src={sale.tokenURI + ".png"}
              alt={`NFT #${sale.tokenId}`}
              boxSize="100px"
              borderRadius="md"
              mb={2}
            />
            <Text fontWeight="bold">SelvaPunk #{sale.tokenId}</Text>
            <Text>
              Vendido por{" "}
              <Image src={ethIcon} alt="ETH" display="inline-block" w="1rem" />
              {sale.price} ETH
            </Text>
            <Text>
              De{" "}
              <Tooltip label={sale.seller}>
                <Button variant="link" size="sm">
                  {shortenAddress(sale.seller)}
                </Button>
              </Tooltip>{" "}
              a{" "}
              <Tooltip label={sale.buyer}>
                <Button variant="link" size="sm">
                  {shortenAddress(sale.buyer)}
                </Button>
              </Tooltip>
            </Text>
            <Text>
              Recaudado:{" "}
              <Image src={ethIcon} alt="ETH" display="inline-block" w="1rem" />
              <b>{(sale.price * 0.05).toFixed(4)} ETH</b> (S/.{(sale.price * 0.05 * ethPrice * usdToPenRate).toFixed(2)})
            </Text>
            <Text>
              <a href={`https://holesky.etherscan.io/tx/${sale.txHash}`} target="_blank" rel="noopener noreferrer">Ver transacción</a>
            </Text>
          </Box>
        ))}
      </Flex>

      {/* Historial de Retiros */}
      <Heading size="md" mt={6} mb={4}>
  Historial de Retiros:
</Heading>
<Box maxHeight="200px" overflowY="auto" border="1px solid #ccc" p={4}>
  {lastWithdrawals.map((withdrawal, index) => (
    <Text key={index} mb={2}>
      <Image src={ethIcon} alt="ETH" display="inline-block" w="1rem" />
      {withdrawal.amount.toFixed(4)} ETH{" "}
      (S/.{(withdrawal.amount * ethPrice * usdToPenRate).toFixed(2)}) retirados el{" "}
      {new Date(withdrawal.timestamp * 1000).toLocaleString()}{" "}
      <a
        href={`https://holesky.etherscan.io/tx/${withdrawal.txHash}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Ver transacción
      </a>
    </Text>
  ))}
</Box>

      {account === organizationWallet && (
        <Button colorScheme="teal" mt={6} onClick={handleWithdrawFunds}>
          Retirar Fondos
        </Button>
      )}
    </Flex>
  );
};

export default Financiamiento;
