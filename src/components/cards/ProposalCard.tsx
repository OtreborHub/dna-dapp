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
import Swal from 'sweetalert2';

export default function ProposalCard({ proposal, handleVote, handleExecute }: ProposalProps) {
  const appContext = useAppContext();

  async function vote(vote: Vote) {
    if (handleVote) {
      const votes: boolean[] = parseVote(vote);
      handleVote(proposal.address, votes[0], votes[1]);
    }
  }

  async function execute() {
    if (handleExecute) {
      Swal.fire({
        icon: "question",
        title: "Conferma esecuzione",
        text: "Sei sicuro di voler eseguire la proposta?",
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Conferma"
      }).then((result) => {
        if (result.isConfirmed) {
          handleExecute(proposal.address);
        }
      });
    }
  }

  return (
    <>
      <Card sx={{
        boxShadow: "5px 5px #888888",
        border: "2px solid",
        borderColor: proposal.approved ? "green" : proposal.executed ? "red" : "black"
      }}>

        {proposal.executed &&
          <Typography sx={{ textAlign: "right", color: proposal.approved ? "green" : "red", marginTop: "0.5rem", marginRight: "1rem" }}>
            {proposal.approved ? "approvata" : "respinta"}
          </Typography>
        }

        <CardHeader
          title={proposal.title}
          subheader={formatNumberAddress(proposal.address)}
          sx={{ paddingTop: proposal.executed ? "0.2rem" : "" }}
        />

        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {proposal.description}
          </Typography>
          {proposal.recipient && proposal.amount > 0 &&
            <>
              <hr />
              <Typography variant="body2" color="text.secondary">
                {"Trasferimento: " + formatNumberAddress(proposal.recipient)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {"Quantità: " + proposal.amount}
              </Typography>
            </>
          }
          {proposal.executed &&
            <>
              <hr />
              <Typography variant="body2" color="text.secondary">
                {"Risultato: " + proposal.voteCountPro + " / " + proposal.voteCountCon}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {"Astenuti: " + proposal.voteCountAbstain}
              </Typography>
            </>
          }
        </CardContent>
        {appContext.role === Role.MEMBER && !proposal.executed &&
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
              style={{ width: "33%", marginBottom: ".2rem" }}>
              CONTESTA
            </Button>
            <Button
              onClick={() => vote(Vote.ABSTAIN)}
              variant="text"
              // color="warning"
              style={{ width: "33%", marginBottom: ".2rem", color: "black" }}>
              ASTIENITI
            </Button>
          </CardActions>
        }
        {appContext.role === Role.OWNER && !proposal.executed &&
          <CardActions>
            <Button
              onClick={() => execute()}
              variant="contained"
              color="success"
              style={{ width: "100%" }}>
              ESEGUI
            </Button>
          </CardActions>
        }
      </Card>
    </>
  );
}