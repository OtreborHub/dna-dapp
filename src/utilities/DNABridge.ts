import { Contract, Provider, ethers } from "ethers";
import { DNAERC20_ABI } from "../abi/erc20_abi";
import { DNADAO_ADDRESS } from "./DAOBridge";
import { ErrorMessage, swalError } from "./Error";
import { Action } from "./actions";
import Swal from "sweetalert2";

const DNAERC20_ADDRESS: string = process.env.REACT_APP_DNAERC20_ADDRESS as string;
export var token: Contract;

export default function getDNAContractInstance(provider: Provider, signer: string) {
  try {
    if (!token) {
      token = new Contract(DNAERC20_ADDRESS, DNAERC20_ABI, provider);
      addContractListeners(signer);
    }
  } catch {
    console.log("Error during contract instance creation: verifiy contract address, abi and provider used");
  }
  
}

//EVENTS 
function addContractListeners(signer: string) {
  token.on("Approval", (owner, spender, value, event) => {
    if (owner === signer) {
      Swal.fire({
        title: "Approvazione effettuata!",
        text: "L'approvazione dei DNA è avvenuta con successo. Con i tuoi DNA ora puoi comprare shares dell'orgazzione DnA.\n\nPremi OK per ricaricare la pagina.",
        icon: "success",
        confirmButtonColor: "#3085d6"
      }).then((result) => {
        if(result.isConfirmed){
          window.location.reload();
        }
      });
    }}
  );

  token.on("BuyOrder", (buyer, amount, event) => {
    if (buyer === signer) {
      Swal.fire({
        title: "Acquisto effettuato!",
        text: "L'acquisto dei DNA Token è avvenuta con successo. Approva i tuoi Token e poi usali per acquistare Shares.\n\nPremi OK per ricaricare la pagina.",
        icon: "success",
        confirmButtonColor: "#3085d6"
      }).then((result) => {
        if(result.isConfirmed){
          window.location.reload();
        }
      });
    }}
  );
}

export async function readCurrentSupply() {
    try {
      const currentSupply = await token.currentSupply();
      return Number(currentSupply);
    } catch (error: any) {
      console.log("readContractBalance action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
      return 0.0;
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

export async function updateTokenPrice(newPrice: number){
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(DNAERC20_ADDRESS, DNAERC20_ABI, signer);

    await signerContract.updateTokenPrice(newPrice);
    return true;

  } catch (error: any) {
    console.log("updateTokenPrice action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.UPDATE_PRICE, error);
    return false;
  }
}
