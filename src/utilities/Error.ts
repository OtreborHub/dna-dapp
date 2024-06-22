import Swal from "sweetalert2";
import { Action } from "./actions";

export enum ErrorMessage {

    //WALLET FRONTEND ERRORS
    WALLET_ERROR="Benvenuto! ]Per favore connetti il tuo wallet sulla rete Sepolia Testnet per accedere all'applicativo",
    NO_DNA_TOKEN="Il tuo portafoglio non contiene DNA.]Acquista Token DNA per avere accesso alla governance!",
    NOT_MEMBER="Il tuo portafoglio non appartiene al registro dei membri.]Acquista parte delle shares DnA ed inizia la tua avventura con noi!",
    APPROVE_ISTRUCTION="Per prima cosa approva una quantità di DNA Token che DNA Administration potrà usare per l'acquisto degli share,]successivamente puoi spenderli per acquistare Shares.",
    
    //GENERIC ERRORS
    RD="Error reading contract data",
    TR="Transaction refused",
    IO="Input error",

    // Contract Messages
    IF="Insufficient funds",
    IA="Insufficient allowance",

    SENDER_NOT_OWNER="Sender must be the owner",
    SENDER_NOT_MEMBER="Sender must be a member",
    ADDRESS_NOT_MEMBER="Address not owned by a member",
    SENDER_IS_OWNER="Sender can't be the owner",
    SALE_CLOSED="Sale is closed",
    SALE_ALREADY_DISABLED="Sale already disabled",
    SALE_ALREADY_ENABLED="Sale already enabled",
    EMPTY_TITLE="Empty title",
    EMPTY_DESC="Empty description",
    PROP_EXECUTED="Proposal already executed",
    NOT_ENOGHT_VOTES="Not enoght votes",
    ALREADY_VOTED="Already voted",
    PROP_TRANSFER="Token transfer failed",
    PROP_NOT_FOUND="Proposal not fund"

}

export function transformMessage(message: ErrorMessage){
    return message.split("]");
}

export function swalError(errorMessage: ErrorMessage, action?: Action, error?: any){
    let shortMessage = "";
    let title = "";
    let text = "";

    //transazione rifiutata dall'utente (Metamask - The request is rejected by the user)
    if(error && error.info && error.info.error && error.info.error.code === 4001){
        return;
    } else
    if(error && error.shortMessage && error.shortMessage.includes("execution reverted:")){
        shortMessage = error.shortMessage.split(":")[1].trim().replace("\"", "").slice(0, -1);
    } else
    if(error && error.code){
        shortMessage = String(error.code).toLowerCase().replace("_", " ");
        shortMessage = shortMessage.charAt(0).toUpperCase() + shortMessage.slice(1);
    }

    let outputMessage = shortMessage ? shortMessage : errorMessage;
    switch(outputMessage){
        case ErrorMessage.RD:
            title = "Errore durante il recupero dei dati";
            if(action){
                text = "Si è verificato un errore durante l'operazione di " + action + ".\nRiprova più tardi.";
            }
            break;

        case ErrorMessage.TR:
            if (action && action === Action.EXECUTE_PROP) {
                title = "Esecuzione della proposta non riuscita";
                text = "Si prega di riprovare più tardi."
            } else if (action && (action === Action.DELEGATE_MEMBER || action === Action.REVOKE_DELEGATE)) {
                title = "Modifica delle deleghe non riuscita";
                text = "Si prega di riprovare più tardi."
            } else if(action){
                title = "Qualcosa è andato storto!";
                text = "Si è verificato un errore durante l'operazione di " + action + ".\nRiprova più tardi.";
            } else {
                text = "Si è verificato un errore generico.\nRiprova più tardi."
            }
            break;

        case ErrorMessage.IF:
            title = "Saldo Insufficiente!";
            if (action && action === Action.BUY_SHARES) {
                text = "Verifica che il tuo saldo sia sufficiente, o rivedi la quantità di Shares inserite.";
            } else if (action && action === Action.BUY_DNA){
                text = "Verifica che il tuo saldo sia sufficiente, o rivedi la quantità di wei inserita";
            }
            break;

        case ErrorMessage.SENDER_IS_OWNER:
            title = "Operazione non permessa";
            if(action && action === Action.BUY_SHARES){
                text = "L'Owner non può comprare DNA Shares!"
            }
            break;

        case ErrorMessage.IA:
            title = "Saldo approvato insufficiente!";
            text = "Verifica di aver prima approvato i DNA che stai trasformando in Shares!";
            break;

        case ErrorMessage.SENDER_NOT_OWNER:
        case ErrorMessage.SENDER_NOT_MEMBER:
            title = "Utente non autorizzato alla funzionalità";
            break;


        case ErrorMessage.SALE_CLOSED:
            title = "Vendita non abilitata";
            text = "Ci dispiace, la vendita degli Shares DNA al momento è disabilitata."
            break;

        case ErrorMessage.SALE_ALREADY_ENABLED:
            title = "La vendita di Share DNA è già abilitata"
            break;

        case ErrorMessage.SALE_ALREADY_DISABLED:
            title = "La vendita di Share DNA è già abilitata";
            break;

        case ErrorMessage.EMPTY_TITLE:
            title = "Titolo vuoto: scegli un titolo per la tua proposta.";
            break;

        case ErrorMessage.EMPTY_DESC:
            title = "Descrizione vuota: scegli una descrizione per la tua proposta";
            break;

        case ErrorMessage.PROP_EXECUTED:
            title = "Proposta già eseguita";
            break;

        case ErrorMessage.NOT_ENOGHT_VOTES: 
            title = "Voti non sufficenti per l'esecuzione della proposta";
            break;

        case ErrorMessage.IO:
            title = "Parametri di input non validi";
            
            break;

        case ErrorMessage.PROP_TRANSFER: 
            title = "Errore durante il trasferimento di ether nell'esecuzione della proposta";
            break;

        case ErrorMessage.ALREADY_VOTED:
            title = "Impossibile votare";
            text = "Hai già votato questa proposta o il membro che hai delegato ha votato per te.";
            break;
        
        default: 
            title = "Qualcosa è andato storto!";
            text = "Si prega di riprovare più tardi";
    }

    if(title || text){
        Swal.fire({
            icon: "error",
            title: title,
            text: text,
            confirmButtonColor: "#3085d6",
            showCloseButton: true
        });
    }
}

