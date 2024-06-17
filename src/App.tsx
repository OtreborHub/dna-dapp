
import { Provider, ethers } from "ethers";

import { useEffect } from 'react';
import './App.css';
import { useAppContext } from "./Context";
import Navbar from "./components/Navbar";
import NewMemberView from "./components/views/NewMemberView";
import { ErrorMessage } from "./utilities/Error";
import { Role, getRole } from "./utilities/Role";
import ProposalDashboardView from "./components/views/ProposalDashboardView";
import Typography from "@mui/material/Typography/Typography";
import getDNAContractInstance, { readAllowance, readCurrentSupply, readDNABalance } from "./utilities/DNABridge";
import getDAOContractInstance, { readMember, readOwner, readSaleState, readShares } from "./utilities/DAOBridge";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const SEPOLIA_CHAIN_ID = 11155111;

export default function App() {
  const appContext = useAppContext();
  
  useEffect(() => {
    connectWallet();
    
    //Events
    window.ethereum.on('chainChanged', handleChanges);
    window.ethereum.on('accountsChanged', handleAccountChanges);
  }, []);

  const handleChanges = () => {
    console.log(window.ethereum.chainId);
    window.location.reload();
  };

  const handleAccountChanges = async (accounts:any) => {
    if (accounts.length === 0) {
      console.log('Please connect to Metamask.');
      disconnect();
      window.location.reload();
    } else if(appContext.signer !== "" && accounts.length > 1) {
      window.location.reload();
    } else {
      await connectWallet();
      window.location.reload();
    }
  };

  async function connectWallet() {
    try{
      if(window.ethereum){
          const provider = new ethers.BrowserProvider(window.ethereum);
          appContext.updateProvider(provider);

          const signer = await provider.getSigner();
          appContext.updateSigner(signer.address);

          setAccountBalance(provider, signer.address);
          appContext.updateChainId(parseInt(window.ethereum.chainId));

          init(signer.address);
        
      } else {
        let provider = new ethers.InfuraProvider("sepolia" , process.env.INFURA_API_KEY);
        appContext.updateProvider(provider);
        
        const signer = await provider.getSigner();
        appContext.updateSigner(signer.address);

        setAccountBalance(provider, signer.address);
        appContext.updateChainId(parseInt(window.ethereum.chainId));

        init(signer.address);
      }
    } catch {
      disconnect();
      console.log("Error retrieving BrowserProvider");
    }
  }

  async function disconnect() {
    appContext.updateSigner("");
    appContext.updateBalance(0);
  }

  async function init(signer: string) {
    try {
        getDAOContractInstance(appContext.provider, signer);
        getDNAContractInstance(appContext.provider, signer);
        
        const ownerResult: string = await readOwner();
        const isOwner = ownerResult === signer;
        const isMember = await readMember();
        appContext.updateRole(getRole(isOwner, isMember));

        const DNABalance: number = await readDNABalance();
        appContext.updateDNABalance(Number(DNABalance));
        if(Number(DNABalance) > 0){
          const allowance: number = await readAllowance();
          appContext.updateAllowance(Number(allowance));
        }

        const saleActive: boolean = await readSaleState();
        appContext.updateSaleActive(saleActive);
        const currentSupply: number = await readCurrentSupply();
        appContext.updateCurrentSupply(Number(currentSupply));

        if(isMember){
          const shares: number = await readShares();
          appContext.updateShares(Number(shares));
        }

    } catch {
      console.log("Error contract initialization");
    }

  }

  async function setAccountBalance(provider: Provider, signer: string){
    if(!provider || !signer) return;

    await provider.getBalance(signer).then((balance: bigint) => {
      const bal = parseFloat(ethers.formatEther(balance));
      console.log(`balance available: ${bal.toFixed(18)} ETH`);
      appContext.updateBalance(bal);
    });
  }

  const verifyWalletNetwork = () => {
    return appContext.signer && appContext.chainId === SEPOLIA_CHAIN_ID;
  }

  const verifyDNABalance = () => {
    return appContext.DNABalance > 0;
  }

  const verifyRole = () => {
    return appContext.role === Role.MEMBER || appContext.role === Role.OWNER;
  }


  return (
    <div className="App" id="app">

      <Navbar connect={connectWallet}/>
      
      <div className="main-div">
        <Typography 
          className="bebas-regular" 
          variant="h2" 
          paddingTop={"3rem"} 
          paddingBottom={"3rem"} 
          textAlign={"center"}
          sx={{ cursor: 'default' }}>
          DnA DAO Administration
        </Typography>
      
      { !verifyWalletNetwork() && <NewMemberView errorMessage={ErrorMessage.WALLET_ERROR}/> }
      { verifyWalletNetwork() && !verifyRole() && !verifyDNABalance() && <NewMemberView errorMessage={ErrorMessage.NO_DNA_TOKEN} />}
      { verifyWalletNetwork() && !verifyRole() && verifyDNABalance() && <NewMemberView errorMessage={ErrorMessage.NOT_MEMBER} />}
      { verifyWalletNetwork() && verifyRole() && <ProposalDashboardView /> }

      </div>
    </div>
  );
}

