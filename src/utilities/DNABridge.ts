import { Contract, Provider, ethers } from "ethers";
import { DNAERC20_ABI } from "../abi/erc20_abi";
import { DNADAO_ADDRESS } from "./DAOBridge";
import { ErrorMessage, swalError } from "./Error";
import { Action } from "./actions";

const DNAERC20_ADDRESS: string = process.env.REACT_APP_DNAERC20_ADDRESS as string;
export var token: Contract;

export default function getDNAContractInstance(provider: Provider, signer: string) {
  try {
    if (!token) {
      token = new Contract(DNAERC20_ADDRESS, DNAERC20_ABI, provider);
      //addContractListeners(signer);
    }
  } catch {
    console.log("Errore durante la creazione dell'istanza del contratto ERC20: verificare l'indirizzo del contratto, l'abi e il provider utilizzato");
  }
  
}

//EVENTS 
// function addContractListeners(signer: string) {
//   token.on("BuyOrder", (user, amount, event) => {
//     if (user === signer) {
//       //Firebase data
//       Swal.fire({
//         title: "Acquisto effettuato!",
//         text: "L'acquisto dei DNA è avvenuto con successo. Con i tuoi DNA ora puoi comprare azioni dell'orgazzione DnA.\n\nPremi OK per ricaricare la pagina.",
//         icon: "success",
//       }).then((result) => {
//         if(result.isConfirmed){
//           window.location.reload();
//         }
//       });
//     }}
//   );

// }

export async function readCurrentSupply() {
  if (token) {
    try {
      const currentSupply = await token.currentSupply();
      return Number(currentSupply);
    } catch (error: any) {
      console.log("readContractBalance action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
      return 0.0;
    }
  }
}


export async function buyDNAToken(amount: number) {
  if (token) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNAERC20_ADDRESS, DNAERC20_ABI, signer);
  
      let options = { value: amount }
      await signerContract.buyDNA(options);
      return true;

    } catch (error: any) {
      console.log("buyDNAToken action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.BUY_DNA, error);
      return false;
    }
  }
}

export async function approveDNAToken(amount: number){
  if(token) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNAERC20_ADDRESS, DNAERC20_ABI, signer);
  
      await signerContract.approve(DNADAO_ADDRESS, amount);
      return true;

    } catch (error: any) {
      console.log("approveDNA action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.BUY_SHARES, error);
      return false;
    }
  }
}

export async function readDNABalance(){
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      const balance: number = await token.balanceOf(signer.address);
      return balance;
  
    } catch (error: any) {
      console.log("readDNABalance action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.RD_DATA, error);
      return 0.0;
    }
}

export async function readAllowance(){
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNAERC20_ADDRESS, DNAERC20_ABI, signer);
  
      const allowance: number = await signerContract.allowance(signer.address, DNADAO_ADDRESS);
      return Number(allowance);

    } catch (error: any) {
      console.log("readAllowance action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.RD_DATA, error);
      return 0.0;
    }
}