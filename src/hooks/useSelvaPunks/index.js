import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import SelvaPunksArtifact from '../../config/web3/artifacts/SelvaPunks';

const { address, abi } = SelvaPunksArtifact;

const useSelvaPunks = () => {
    const { active, library, chainId } = useWeb3React();

    const selvaPunks = useMemo(() => {
      if(active) return new library.eth.Contract(abi, address[chainId])
    }, [active, chainId, library?.eth?.Contract]);

    return selvaPunks;
};

export default useSelvaPunks;