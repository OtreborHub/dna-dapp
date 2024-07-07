import { Contract, Provider, ethers } from "ethers";
import { DNADAO_ABI } from "../abi/dao_abi";
import { Action } from "./actions";
import { ErrorMessage, swalError } from "./Error";
import { Proposal } from "./interfaces";
import Swal from "sweetalert2";

export const DNADAO_ADDRESS: string = process.env.REACT_APP_DNADAO_ADDRESS as string;
export var dao: Contract;
export const EMPTY_PROPOSAL: Proposal = { address: "", title: "", description: "", voteCountPro: 0, voteCountCon: 0, voteCountAbstain: 0, executed: false, approved: false, recipient: "", amount: 0 };

export default function getDAOContractInstance(provider: Provider, signer: string) {
  try {
    if (!dao) {
      dao = new Contract(DNADAO_ADDRESS, DNADAO_ABI, provider);
      addContractListeners(signer);
    }
  } catch {
    console.log("Error during contract instance creation: verifiy contract address, abi and provider used");
  }

}

//EVENTS 
function addContractListeners(signer: string) {
  dao.on("BuyOrder", (buyer, amount, event) => {
    if (buyer === signer) {
      Swal.fire({
        title: "Acquisto effettuato!",
        text: "Congratulazioni, sei appena diventato un membro della governance DNA.\n\nPremi OK per ricaricare la pagina ed accedere alle proposte.",
        icon: "success",
        confirmButtonColor: "#3085d6"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    }
  })

  dao.on("SaleState", (enabled, event) => {
    Swal.fire({
      title: enabled ? "Vendita Shares abilitata" : "Vendita Shares disabilitata",
      text: enabled ? "Da ora è possibile comprare Shares dal Menù Ruolo\n\nPremi OK per ricaricare la pagina" : "Al momento non è più possibile comprare Shares dal Menù Ruolo\n\nPremi OK per ricaricare la pagina",
      icon: enabled ? "success" : "error",
      confirmButtonColor: "#3085d6"
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
  })

  dao.on("ProposalState", async (title, created, approved, event) => {
    //leggere se signer isMember per stampare questo alert
    const isMember = await readMember();
    const owner = await readOwner();
    if (isMember && created) {
      Swal.fire({
        title: "Nuova proposta creata!\n\n" + title,
        text: "E' stata generata una nuova proposta: si ricorda di leggere attentamente prima di procedere al voto.\nPremi OK per ricarica la pagina.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    } else if (signer === owner && !created){
      Swal.fire({
        title: "Risultato Proposta: " + title,
        text: approved ? "La proposta '" + title + "' è stata approvata" : "La proposta '" + title + "'  non è stata approvata",
        icon: "success",
        confirmButtonColor: "#3085d6"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    }
  })

  dao.on("DelegationState", async (to, addedRemoved, event) => {
    const isMember = await readMember();
    if (isMember) {
      Swal.fire({
        title: addedRemoved ? "Delega avvenuta con successo!" : "Delega rimossa",
        text: addedRemoved ? "Da ora i voti eseguiti dal membro \n\n" + to + " conterranno anche le tue Shares!" : "Da ora il membro \n\n" + to + " \n\n non potrà più rappresentare il tuo voto",
        icon: "success",
        confirmButtonColor: "#3085d6"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    }
  })

  dao.on("Vote", async (member, event) => {
    if (signer === member) {
      Swal.fire({
        title: "Voto effettuato!",
        text: "Il tuo voto è stato registrato correttamente: attendi l'esecuzione della proposta da parte dell'Owner per scoprire il risultato!\nPremi OK per ricarica la pagina.",
        icon: "success",
        confirmButtonColor: "#3085d6"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    }
  })

}

export async function updateSaleState(state: boolean) {
  if (dao) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);

      await signerContract.setSaleState(state);
      return true;

    } catch (error: any) {
      console.log("updateSaleState action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.UPDATE_SALE_STATE, error);
      return false;
    }
  }
}

export async function buyShares(amount: number) {
  if (dao) {
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

export async function voteProposal(proposalAddr: string, support: boolean, abstain: boolean) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);

    await signerContract.voteProposal(proposalAddr, support, abstain);
    return true;

  } catch (error: any) {
    console.log("vote action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.VOTE_PROP, error);
    return false;
  }
}

export async function readProposals() {
  var proposals: Proposal[] = [];

  //Variabile d'ambiente da modificare in caso le proposte estratte siano 
  //eccessive per il front-end o per il numero di chiamate effettuate.
  const FROM : string = process.env.REACT_APP_FROM as string;

  try {
    const contractProposals = await dao.getProposals();
    if (contractProposals.length > 0) {
      for (let i = Number(FROM); i < contractProposals.length; i++) {
        const resultProposal = contractProposals[i];
        let proposal: Proposal = {
          address: resultProposal[0],
          title: resultProposal[1],
          description: resultProposal[2],
          voteCountPro: Number(resultProposal[3]),
          voteCountCon: Number(resultProposal[4]),
          voteCountAbstain: Number(resultProposal[5]),
          executed: Boolean(resultProposal[6]),
          approved: Boolean(resultProposal[7]),
          recipient: resultProposal[8],
          amount: Number(resultProposal[9])
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

export async function readSaleState() {
  if (dao) {
    try {
      const saleActive = await dao.saleEnabled();
      return saleActive;

    } catch (error: any) {
      console.log("readSaleState action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
      return false;
    }
  }
}

export async function readOwner() {
  if (dao) {
    try {
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
    try {
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

export async function delegateVote(address: string) {
  if (dao) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);

      await signerContract.delegateMember(address);
      return true;

    } catch (error: any) {
      console.log("delegateMember action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.DELEGATE_MEMBER, error);
      return false;
    }
  }
}

export async function revokeMemberDelegation(address: string) {
  if (dao) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);

      await signerContract.revokeDelegation(address);
      return true;

    } catch (error: any) {
      console.log("delegateMember action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.REVOKE_DELEGATE, error);
      return false;
    }
  }
}

export async function createProposal(proposal: Proposal) {
  if (dao) {
    try {
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

export async function executeProposal(proposalAddress: string) {
  if (dao) {
    try {

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(DNADAO_ADDRESS, DNADAO_ABI, signer);

      await signerContract.executeProposal(proposalAddress);
      return true;

    } catch (error: any) {
      console.log("executeProposal action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.EXECUTE_PROP, error);
      return false;
    }
  }

}
