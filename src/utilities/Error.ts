import Swal from "sweetalert2";
import { Action } from "./actions";

export enum ErrorMessage {

    //WALLET FRONTEND ERRORS
    WALLET_ERROR="Benvenuto! ]Per favore connetti il tuo wallet sulla rete Sepolia Testnet per accedere all'applicativo",
    NO_DNA_TOKEN = "Il tuo portafoglio non contiene DNA.]Acquista Token DNA per avere accesso alla governance!",
    NOT_MEMBER = "Ancora un paio di step: il tuo portafoglio non appartiene al registro dei membri.]Acquista parte delle azioni DnA ed inizia la tua avventura con noi!",
    APPROVE_ISTRUCTION = "Un'ultimo passaggio: Scusaci per l'iter ma teniamo a proteggere i tuoi DNA.]Abilita DNA Administration ad usare i tuoi DNA, successivamente puoi spenderli per acquistare Shares.",
    RE="Impossibile accedere alla risorsa selezionata",

    //GENERIC ERRORS
    RD="Error reading contract data",
    TR="Transaction refused",
    IO="Input error",
    FE="Firebase error",

    // Contract Messages
    IF="Insufficient funds",
    SU="Sender unauthorized",

    AP="Admin already present",

    CNT="Customer not found",
    SAS="Customer already has a subscription",
    SNS="Customer has no active subscription",

    MNT="Magazine not found",
    MAP="Magazine already present",
    MAR="Magazine already released",
    MNR="Magazine not released",
    MAO="Magazine already owned",

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
    if(error && error.shortMessage && error.shortMessage.includes("execution reverted")){
        shortMessage = error.shortMessage.split(":")[1].trim().replace("\"", "").slice(0, -1);
    } else
    if(error && error.code){
        shortMessage = String(error.code).toLowerCase().replace("_", " ");
        shortMessage = shortMessage.charAt(0).toUpperCase() + shortMessage.slice(1);
    }

    switch(shortMessage ? shortMessage : errorMessage){
        case ErrorMessage.RD:
            title = "Errore durante il recupero dei dati";
            if(action){
                text = "Si è verificato un errore durante l'operazione di " + action + ".\nRiprova più tardi.";
            }
            break;

        case ErrorMessage.TR:
            title = "Qualcosa è andato storto!";
            if(action){
                text = "Si è verificato un errore durante l'operazione di " + action + ".\nRiprova più tardi.";
            } else {
                text = "Si è verificato un errore generico.\nRiprova più tardi."
            }
            break;

        case ErrorMessage.IF:
            title = "Saldo Insufficiente!";
            // if(action && (action === Action.WITHDRAW || action === Action.SPLIT_PROFIT)){
            //     text = "Verifica che il saldo del contratto sia sufficiente per il prelievo";
            if (action && action === Action.BUY_SHARES) {
                text = "Verifica che il tuo saldo sia sufficiente, o rivedi la quantità di shares inserite.";
            } else if (action && action === Action.BUY_DNA){
                text = "Verifica che il tuo saldo sia sufficiente, o rivedi la quantità di wei inserita";
            }
            // } else if (action && action === Action.DONATION) {
            //     text = "Si è verificato un errore durante l'invio della donazione.";
            // } else if (action && action === Action.MIN_DONATION) {
            //     text = "Attenzione, il tuo bilancio è inferiore al valore minimo di donazione.";
            // }
            break;

        case ErrorMessage.SU:
            title = "Utente non autorizzato alla funzionalità";
            break;

        case ErrorMessage.AP:
            title = "Indirizzo già presente nella lista degli amministratori";
            break;

        case ErrorMessage.CNT:
            title = "Indirizzo cliente non trovato";
            break;

        case ErrorMessage.SAS:
            title = "Utente già abbonato"
            break;

        case ErrorMessage.SNS:
            title = "Nessun abbonamento attivo per l'utente"
            break;

        case ErrorMessage.MNT:
            title = "Magazine non trovato";
            break;

        case ErrorMessage.MAP:
            title = "Magazine già esistente";
            break;

        case ErrorMessage.MAR:
            title = "Magazine già rilasciato";
            break;

        case ErrorMessage.MNR:
            title = "Magazine non rilasciato";
            break;

        case ErrorMessage.MAO: 
            title = "Magazine già acquistato";
            text = "Puoi consultare i tuoi magazine dal Menu Ruolo in alto a sinistra";
            break;

        case ErrorMessage.IO:
            title = "Parametri di input non validi";
            // if(action && action === Action.SRC_ADDR_PROP){
            //     title = "Seleziona un criterio di ricerca";
            //     text = "Ricontrolla l'indirizzo inserito e assicurati che sia un indirizzo valido";
            if (action && action === Action.EXECUTE_PROP) {
                title = "Esecuzione della proposta non riuscita";
            }
            break;

        case ErrorMessage.FE: 
            title = "Errore durante l'interazione con la base dati";
            if(action){
                text = "Si è verificato un errore durante l'operazione di " + action + ".\nRiprova più tardi.";
            }
            break;

        case ErrorMessage.RE:
            title = errorMessage;
            if(action){
                text = "Si è verificato un errore durante l'operazione di " + action + ".\nRiprova più tardi.";
            }

            break;
        
        default: 
            title = "Qualcosa è andato storto!";
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

