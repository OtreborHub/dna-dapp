import Button from '@mui/material/Button/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../../Context';
import { Role } from '../../utilities/Role';
import parseVote, { Vote } from '../../utilities/Vote';
import { formatNumberAddress } from '../../utilities/helper';
import { ProposalProps } from '../../utilities/interfaces';

export default function ProposalCard( {proposal, handleVote, handleExecute} : ProposalProps) {
  const appContext = useAppContext();

  // useEffect(() => {
  //   getProposal();
  // }, [])

  // async function getProposal(){
  //   try {
  //     //contractBridge.getProposal()
  //     return true;
  //   } catch (error) {
  //     console.log("Errore durante il recupero delle proposte");
  //   }
  // }

  async function vote(vote:Vote) {
    if(handleVote){
      const votes: boolean[] = parseVote(vote);
      handleVote(proposal.address, votes[0], votes[1]);
    }
  }

  async function execute() {
    //Swal.fire - sei sicuro di voler eseguire la proposta?
    if(handleExecute){
      handleExecute(proposal.address);
    }
  }
  
  return (
    <>
    <Card sx={{boxShadow: "5px 5px #888888", border: "2px solid", borderColor: "black"}}>
      <CardHeader
        title={proposal.title}
        subheader={formatNumberAddress(proposal.address)}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {proposal.description}
        </Typography>
      </CardContent>
      { appContext.role === Role.MEMBER && 
        <CardActions>
          <Button
              onClick={() => vote(Vote.SUPPORT)}
              variant="contained"
              // color="success"
              style={{ width: "33%", marginBottom: ".2rem" }}>
              SUPPORTA
          </Button>
          <Button
              onClick={() => vote(Vote.CONTEST)}
              variant="contained"
              // color="warning"
              style={{ width: "33%", marginBottom: ".2rem"}}>
              CONTESTA
          </Button>
          <Button
              onClick={() => vote(Vote.ABSTAIN)}
              variant="text"
              // color="warning"
              style={{ width: "33%", marginBottom: ".2rem", color: "black"}}>
              ASTIENITI
          </Button>
        </CardActions>
      }
      { appContext.role === Role.OWNER && 
        <CardActions>
          <Button
            onClick={() => execute()}
            variant="contained"
            color="success"
            style={{ width: "100%"}}>
            ESEGUI
          </Button>
        </CardActions>
        }
    </Card>
    </>
  );

  

}