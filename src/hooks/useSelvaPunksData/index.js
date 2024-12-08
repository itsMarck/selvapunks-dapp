import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect } from 'react';
import { useState } from 'react';
import useSelvaPunks from '../useSelvaPunks';

const getPunkData = async ({ selvaPunks, tokenId }) => {
const [tokenURI, owner] = await Promise.all([
selvaPunks.methods.tokenURI(tokenId).call(),
selvaPunks.methods.ownerOf(tokenId).call(),
]);
const responseMetadata = await fetch(tokenURI);
const metadata = await responseMetadata.json();

return {

    tokenId,
    tokenURI,
    owner,
    metadata,
    ...metadata,
};
};

//PLURAL
const useSelvaPunksData = ({ owner = null } = {}) => {
 const [punks, setPunks] = useState([]);
 const { library } = useWeb3React();
 const [loading, setLoading] = useState(true);
 const selvaPunks = useSelvaPunks();

 const update = useCallback(async () => {
   if(selvaPunks){
       setLoading(true);
       let tokenIds;
       if (!library.utils.isAddress(owner)) {
        const totalSupply = await selvaPunks.methods.totalSupply().call();
        tokenIds = new Array(Number(totalSupply))
          .fill()
          .map((_, index) => index);
      } else {
        const balanceOf = await selvaPunks.methods.balanceOf(owner).call();

        const tokenIdsOfOwner = new Array(Number(balanceOf))
          .fill()
          .map((_, index) =>
            selvaPunks.methods.tokenOfOwnerByIndex(owner, index).call()
          );

        tokenIds = await Promise.all(tokenIdsOfOwner);
      }

      const punksPromise = tokenIds.map((tokenId) =>
        getPunkData({ tokenId, selvaPunks })
      );

      const punks = await Promise.all(punksPromise);

      setPunks(punks);
      setLoading(false);
    }
  }, [selvaPunks, owner, library?.utils]);

 useEffect(() => {
update();
 }, [update]);

 return {
   loading,
   punks,
   update,
 };
};

export { useSelvaPunksData } ;


//SINGULAR
//const useSelvaPunkData = () => {
//
//}