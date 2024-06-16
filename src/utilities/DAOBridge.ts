import { Contract, Provider, ethers } from "ethers";
import { DNADAO_ABI } from "../abi/dao_abi";
import { Action } from "./actions";
import { ErrorMessage, swalError } from "./Error";
import { Proposal } from "./interfaces";

export const DNADAO_ADDRESS: string = process.env.REACT_APP_DNADAO_ADDRESS as string;
export var dao: Contract;
export const EMPTY_PROPOSAL: Proposal = { address: "", title: "", description: "", voteCountPro: 0, voteCountCon: 0, voteCountAbstain: 0, executed: false, recipient: "", amount: 0 };

export default function getDAOContractInstance(provider: Provider, signer: string) {
  try {
    if (!dao) {
      dao = new Contract(DNADAO_ADDRESS, DNADAO_ABI, provider);
      //addContractListeners(signer);
    }
  } catch {
    console.log("Errore durante la creazione dell'istanza del contratto: verificare l'indirizzo del contratto, l'abi e il provider utilizzato");
  }
  
}

//EVENTS 
// function addContractListeners(signer: string) {
//   dao.on("BuyOrder", (customer, event) => {
//     if (customer === signer) {
//       //Firebase data
//       Swal.fire({
//         title: "Acquisto effettuato!",
//         text: "Congratulazioni, sei appena diventato un membro della governance DNA.\n\nPremi OK per ricaricare la pagina ed accedere alle proposte.",
//         icon: "success",
//         confirmButtonColor: "#3085d6"
//       }).then((result) => {
//         if(result.isConfirmed){
//           window.location.reload();
//         }
//       });
//     }
// })
// }

//Modificare in enableSale
export async function activeSale(){
  if(dao){
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);
  
      await signerContract.activeSale();
      return true;

    } catch (error: any) {
      console.log("activeSale action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.ENABLE_SALE, error);
      return false;
    }
  }
}

//Modificare in disableSale
export async function endSale(){
  if(dao){
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);
  
      await signerContract.endSale();
      return true;

    } catch (error: any) {
      console.log("endSale action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.DISABLE_SALE, error);
      return false;
    }
  }
}


export async function buyShares(amount: number){
  if(dao){
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);
  
      await signerContract.buyShares(amount);
      return true;

    } catch (error: any) {
      console.log("buyShares action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.BUY_SHARES, error);
      return false;
    }
  }
}

export async function vote(proposalAddr: string, support: boolean, abstain: boolean){
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);

    await signerContract.vote(proposalAddr, support, abstain);
    return true;

  } catch (error: any) {
    console.log("vote action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.VOTE, error);
    return false;
  }
}


//Quando le proposte saranno troppe e non si vorrà fetchare tante proposte alla volta
//sarà sufficiente modificare la variabile d'ambiente FROM, 
//per consentire all'applicazione di estrarre proposte a partire dall'indice indicato
//default REACT_APP_FROM = 0

export async function readProposals() {
  var proposals: Proposal[] = [];
  // let from : number = Number(process.env.REACT_APP_FROM as string);

  try {
    const contractProposals = await dao.getProposals();
    if(contractProposals.length > 0){
      for(let i = 0; i < contractProposals.length; i++){
        const resultProposal = contractProposals[i];
        let proposal: Proposal = {
          address: resultProposal[0],
          title: resultProposal[1],
          description: resultProposal[2],
          voteCountPro: Number(resultProposal[3]),
          voteCountCon: Number(resultProposal[4]),
          voteCountAbstain: Number(resultProposal[5]),
          executed: Boolean(resultProposal[6]),
          recipient: resultProposal[7],
          amount: Number(resultProposal[8])
        }

        proposals.push(proposal);
      }
    }
    console.log("Extracted " + proposals.length + " proposals");
    return proposals;

  } catch (error: any) {
    console.log("readAllMagazines action: " + ErrorMessage.RD);
    swalError(ErrorMessage.RD, Action.RD_ALL_PROP, error);
    return [];
  } 
 }

export async function readShares() {
  if (dao) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const shares = await dao.shares(signer);
      return shares;

    } catch (error: any) {
      console.log("readShares action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function readSaleActive(){
  if (dao) {
    try{
      const saleActive = await dao.saleActive();
      return saleActive;

    } catch (error: any) {
      console.log("readSaleActive action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
      return false;
    }
  }
}

export async function readOwner() {
  if (dao) {
    try{
      const owner = await dao.owner();
      return owner;

    } catch (error: any) {
      console.log("readOwner action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function readMember() {
  if (dao) {
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);

      return await signerContract.isMember();
    
    } catch (error: any) {
      console.log("readMember action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function delegateMember(address: string) {
  if (dao) {
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);
  
      await signerContract.delegateVote(address);
      return true;
      
    } catch (error: any) {
      console.log("delegateMember action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.DELEGATE_MEMBER, error);
      return false;
    }
  }
}

export async function createProposal(proposal: Proposal) {
  if (dao) {
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);

      await signerContract.createProposal(proposal.title, proposal.description, proposal.recipient, proposal.amount);
      return true;

    } catch (error: any) {
      console.log("createProposal action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.ADD_PROP, error);
      return false;

    }
  }
}

export async function executeProposal(index: number) {
  if (dao) {
    try{
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);
  
      return await signerContract.executeProposal(index);
    } catch (error: any) {
      console.log("executeProposal action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.EXECUTE_PROP, error);
    }
  }

}
