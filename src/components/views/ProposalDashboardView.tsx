import { Box, Button, Grid, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from 'react';
import Swal from "sweetalert2";
// import { useAppContext } from '../../Context';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import withReactContent from "sweetalert2-react-content";
import { useAppContext } from "../../Context";
import '../../styles/view.css';
import { EMPTY_PROPOSAL, createProposal, executeProposal, readProposals, voteProposal } from "../../utilities/DAOBridge";
import { Role } from "../../utilities/Role";
import { Proposal } from "../../utilities/interfaces";
import Loader from '../Loader';
import ProposalCard from "../cards/ProposalCard";
import NewProposalForm from "../forms/NewProposalForm";

export default function ProposalDashboardView() {
  const isMobile = useMediaQuery('(max-width: 750px)');
  const [activeProposals, setActiveProposals] = useState<Proposal[]>();
  const [executedProposals, setExecutedProposals] = useState<Proposal[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const appContext = useAppContext();
  const MySwal = withReactContent(Swal);
  
  useEffect(() => {
    getProposals();
  }, [])

  async function getProposals(){
    try {
      const proposals = await readProposals();
      const activeProposals =  proposals.filter(proposal => proposal.executed === false);
      const executedProposals = proposals.filter(proposal => proposal.executed === true);
      setActiveProposals(activeProposals);
      setExecutedProposals(executedProposals);

    } catch (error) {
      console.log("Error while reading proposals");
    }
  }

  async function handleSubmit(title: string, description: string, recipient?: string, amount?: number){
    try {
      setIsLoading(true);
      const newProposal = EMPTY_PROPOSAL;
      newProposal.title = title;
      newProposal.description = description;
      newProposal.recipient = recipient ? recipient: "0x0000000000000000000000000000000000000000";
      newProposal.amount = amount ? amount : 0;
      const success = await createProposal(newProposal);
      setIsLoading(false);
      if(success){
        Swal.fire({
          title: "Nuova proposta",
          text: "La richiesta di inserimento è avvenuta con successo!\n Per favore attendi l'elaborazione del nuova proposta.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          html: true
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.log("error during creating proposal");
    }
  }

  function newProposal() {
    MySwal.fire({
      title: "Nuova proposta",
      html: <NewProposalForm handleSubmit={handleSubmit}/>,
      showConfirmButton: false,
      showCloseButton: true,
    });
  }

  async function vote(proposalAddress: string, support: boolean, abstain: boolean){
    try {
      setIsLoading(true);
      const success = await voteProposal(proposalAddress, support, abstain);
      setIsLoading(false);
      if(success){
        Swal.fire({
          title: "Richiesta di voto eseguita",
          text: "La tua richiesta di voto sarà elaborata tra qualche secondo!\n\n Per favore OK per continuare.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (error) {
      console.log("Error during voting operation");
    }
  }

  async function execute(proposalAddress: string){
    try {
      setIsLoading(true);
      const success = await executeProposal(proposalAddress);
      setIsLoading(false);
      if(success){
        Swal.fire({
          title: "Richiesta di esecuzione eseguita",
          text: "La tua richiesta di esecuzione proposta sarà elaborata tra qualche secondo!\n\n Per favore OK per continuare.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (error) {
      console.log("Error during execute proposal operation");
    }
  }

  return (
    <>
      { activeProposals && activeProposals.length === 0  && executedProposals && executedProposals.length === 0 &&
      <Box alignItems={"center"} textAlign={"center"} >
      <Typography variant="h4" fontFamily={"sans-serif"} sx={{ cursor: 'default' }}> Nessuna proposta inserita </Typography>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{borderRadius: "10px"}}
          onClick={() => newProposal()}
          endIcon={<AddCircleIcon />}>
          <strong>NUOVA PROPOSTA </strong>
        </Button>
      </Box>
      }

      {/* PROPOSTE ATTIVE */}
      { activeProposals && activeProposals.length > 0 &&
      <>
      <Typography variant="h4" textAlign={"left"} marginLeft={"2rem"} fontFamily={"sans-serif"} sx={{ cursor: 'default' }}> Proposte da valutare </Typography>
      <Box className="card-div" paddingBottom={"2rem"}>
        <Grid container spacing={isMobile ? 4 : 2} sx={{ margin: "1rem" }}>
          {activeProposals?.map(el =>
            <Grid height={"100%"} item key={el.title} xs={6} md={4} xl={3}>
              <ProposalCard
                proposal={el}
                handleVote={vote}
                handleExecute={execute}
              />
            </Grid>
            
          )}
          <Grid item sx={{ alignSelf: "center" }} xs={6} md={4} xl={3}>
          { appContext.role === Role.MEMBER && 
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{borderRadius: "10px"}}
              onClick={() => newProposal()}
              endIcon={<AddCircleIcon />}>
              <strong>NUOVA PROPOSTA </strong>
            </Button>
          }
          </Grid>
        </Grid>
      </Box>
      </>
      }

      {/* PROPOSTE ESEGUITE */}
      { executedProposals && executedProposals.length > 0 &&
      <>
        <Typography variant="h4" textAlign={"left"} marginLeft={"2rem"} fontFamily={"sans-serif"} sx={{ cursor: 'default' }}> Proposte eseguite</Typography>
        
        <Box className="card-div" paddingBottom={"2rem"}>
          <Grid container spacing={isMobile ? 4 : 2} sx={{ margin: "1rem" }}>
            {executedProposals?.map(el =>
              <Grid item key={el.title} xs={6} md={4} xl={3}>
                <ProposalCard
                  proposal={el}
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </>
      }
      <Loader loading={isLoading}/>
    </>
  );
}
