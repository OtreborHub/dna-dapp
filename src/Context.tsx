import { Provider, ethers } from "ethers";
import { createContext, useContext, ReactNode, useState } from "react";
import { Role } from "./utilities/Role";

const infuraApiKey = process.env.REACT_APP_INFURA_API_KEY as string;
const infuraProvider: Provider = new ethers.InfuraProvider("sepolia" , infuraApiKey);

const appContext = createContext({
  updateProvider: (provider:Provider) => {},
  updateChainId: (chainId: number) => {},
  updateSigner: (signer: string) => {},
  updateBalance: (balance: number) => {},
  updateDNABalance: (DNABalance: number) => {},
  updateAllowance: (allowance: number) => {},
  updateShares: (shares: number) => {},
  updateRole: (role: Role) => {},
  updateSaleActive: (saleActive: boolean) => {},
  provider: infuraProvider,
  chainId: 0,
  signer: "",
  balance: 0,
  DNABalance: 0,
  allowance: 0,
  shares: 0,
  role: Role.NONE,
  saleActive: false
});

export function useAppContext() {
  return useContext(appContext);
}

interface AppContextProviderProps {
  children: ReactNode;
}

export function AppContextProvider({ children }: AppContextProviderProps) {
  
  const [provider, setProvider] = useState<Provider>(infuraProvider);
  const [chainId, setChainId] = useState<number>(0);
  const [signer, setSigner] = useState<string>("")
  const [balance, setBalance] = useState<number>(0);
  const [DNABalance, setDNABalance] = useState<number>(0);
  const [allowance, setAllowance] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [role, setRole] = useState<Role>(Role.NONE);
  const [saleActive, setSaleActive] = useState<boolean>(false);

  function updateProvider(provider: Provider) { setProvider(provider); }

  function updateChainId(chainId: number) { setChainId(chainId); }
  
  function updateSigner(signer: string) { setSigner(signer); }
  
  function updateBalance(balance: number) { setBalance(balance); }
  
  function updateDNABalance(DNABalance: number) { setDNABalance(DNABalance); }

  function updateAllowance(allowance: number) { setAllowance(allowance); }

  function updateShares(shares: number) { setShares(shares); }
  
  function updateRole(role: Role) { setRole(role); }

  function updateSaleActive(saleActive: boolean) { setSaleActive(saleActive); }

  return (
    <appContext.Provider value={{
      updateProvider, updateChainId, updateSigner, updateBalance, updateDNABalance, updateShares, updateRole, updateSaleActive, updateAllowance,
      provider, chainId, signer, balance, DNABalance, shares, role, saleActive, allowance}}>
        {children}
    </appContext.Provider>
  );
}