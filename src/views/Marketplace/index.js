import {
  Stack,
  VStack,
  Heading,
  Text,
  Grid,
  Checkbox,
  CheckboxGroup,
  Box,
  Button,
  Flex,
  Center,
} from "@chakra-ui/react";
import { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import MarketCard from "../../components/market-card";
import Loading from "../../components/loading";
import RequestAccess from "../../components/request-access";
import { useMarketPlace } from "../../hooks/useMarketPlace";

const MarketSelvaPunks = () => {
  const { active } = useWeb3React();
  const { punks, loading } = useMarketPlace();
  const [priceOrder, setPriceOrder] = useState("asc"); // Estado para ordenar precios

  const [filters, setFilters] = useState({});

  const handleFilterChange = (property, selectedAttributes) => {
    setFilters((prev) => ({
      ...prev,
      [property]: selectedAttributes,
    }));
  };

  const togglePriceOrder = () => {
    setPriceOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };
  

  const filteredPunks = punks.filter((punk) => {
    return Object.entries(filters).every(([property, selectedAttributes]) => {
      if (!selectedAttributes.length) return true;
      const punkAttributes = punk.metadata.attributes.find(
        (attr) => attr.trait_type === property
      );
      return selectedAttributes.includes(punkAttributes?.value);
    });
  })
  .sort((a, b) => {
    if (priceOrder === "asc") return a.price - b.price;
    return b.price - a.price;
  });
  

  if (!active) return <RequestAccess />;

  return (
    <>
      <VStack spacing={4} mb={8} textAlign="center">
        <Heading fontSize="3xl" color="blue.500">
          Marketplace
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Aquí podrás visualizar todos los SelvaPunks que se encuentran listados en venta. ¡Compra
          y apoya la preservación del medio ambiente!
        </Text>
      </VStack>
      <Center>
    <Flex gap={8} mb={6} wrap="wrap">
    
        {/** Filtros dinámicos por propiedad */}
        {['Fondo', 'Cuerpo', 'Boca', 'Torso', 'Sombrero'].map((property) => (
          <Box key={property}>
            <Heading fontSize="md" mb={2} color="blue.500">
              {property}
            </Heading>
            <CheckboxGroup
              onChange={(selected) => handleFilterChange(property, selected)}
            >
              <VStack align="start">
                {[...new Set(punks.flatMap((punk) => {
                  const attr = punk.metadata.attributes.find(
                    (a) => a.trait_type === property
                  );
                  return attr ? [attr.value] : [];
                }))].map((attribute) => (
                  <Checkbox key={attribute} value={attribute} colorScheme="blue">
                    {attribute}
                  </Checkbox>
                ))}
              </VStack>
            </CheckboxGroup>
          </Box>
        ))}
        {/** Botón para ordenar precios */}
        <Button colorScheme="teal" onClick={togglePriceOrder}>
            {priceOrder === "asc"
              ? "De mayor a menor precio"
              : "De menor a mayor precio"}
          </Button>
      </Flex>
      </Center>
      {loading ? (
        <Loading />
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {filteredPunks
            .filter(({ isActive }) => isActive) // Mostrar solo NFTs activos
            .map(({ name, image, tokenId, price, seller, metadata }) => (
              <MarketCard
                key={tokenId}
                image={image}
                name={name}
                tokenId={tokenId}
                price={price}

                seller={seller}
                metadata={metadata}
              />
            ))}
        </Grid>
      )}
    </>
  );
};

export default MarketSelvaPunks;