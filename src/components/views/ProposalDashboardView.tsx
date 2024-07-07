import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Grid, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from 'react';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import '../../styles/view.css';
import { EMPTY_PROPOSAL, createProposal, executeProposal, readProposals, voteProposal } from "../../utilities/DAOBridge";
import { Proposal } from "../../utilities/interfaces";
import Loader from '../Loader';
import ProposalCard from "../cards/ProposalCard";
import NewProposalForm from "../forms/NewProposalForm";
import { useAppContext } from '../../Context';
import { Role } from '../../utilities/Role';

export default function ProposalDashboardView() {
  const [proposalQuantity, setProposalQuantity] = useState<number>(0);
  const [activeProposals, setActiveProposals] = useState<Proposal[]>();
  const [executedProposals, setExecutedProposals] = useState<Proposal[]>();
  const [trasfCheck, setTrasfCheck] = useState<boolean>(false);
  const [approvedCheck, setApprovedCheck] = useState<boolean>(false);
  const [rejectedCheck, setRejectedCheck] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const MySwal = withReactContent(Swal);
  const isMobile = useMediaQuery('(max-width: 750px)');
  const appContext = useAppContext();
  
  useEffect(() => {
    getProposals();
  }, [trasfCheck, approvedCheck, rejectedCheck])

  async function getProposals(){
    try {
      const proposals = await readProposals();
      let activeProposals =  proposals.filter(proposal => proposal.executed === false);
      let executedProposals = proposals.filter(proposal => proposal.executed === true);

      if(trasfCheck){
        activeProposals = activeProposals.filter(proposal => proposal.amount > 0)
      }
      if(approvedCheck){
        executedProposals = executedProposals.filter(proposal => proposal.approved === true);
      }
      if(rejectedCheck){
        executedProposals = executedProposals.filter(proposal => proposal.approved === false);
      }
      
      setProposalQuantity(proposals.length);
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

  const handleTrasfFilter = () => {
    setTrasfCheck(!trasfCheck);
  }

  const handleApprovedFilter = () => {
    setApprovedCheck(!approvedCheck);
    if(rejectedCheck === true && approvedCheck === false){
      setRejectedCheck(false);
    }
  }

  const handleRejectedFilter = () => {
    setRejectedCheck(!rejectedCheck);
    if(approvedCheck === true && rejectedCheck === false){
      setApprovedCheck(false);
    }
  }


  return (
    <>
      <Box alignItems={"center"} textAlign={"center"} >
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{borderRadius: "10px", marginBottom:"1rem"}}
          onClick={() => newProposal()}
          disabled={ appContext.role === Role.OWNER}
          endIcon={<AddCircleIcon />}>
          <strong>NUOVA PROPOSTA </strong>
        </Button>
      { proposalQuantity === 0 &&
      <Typography variant="body1" fontFamily={"sans-serif"} sx={{ cursor: 'default' }}> Nessuna proposta presente </Typography>
      }
      </Box>

      { proposalQuantity > 0 &&
      <>

        {/* PROPOSTE ATTIVE */}
        <Box display={"flex"} flexDirection={"row"} paddingBottom={"1rem"}>
          <Typography variant="h4" textAlign={"left"} marginLeft={"2rem"} marginRight={"1rem"} fontFamily={"sans-serif"} sx={{ cursor: 'default' }}> Proposte da valutare </Typography>
          <FormGroup sx={{ border: "0.2rem solid", borderRadius: "1rem", padding: "1rem", paddingTop: "0rem", paddingBottom: "0rem"}}>
          <FormControlLabel control={<Checkbox  checked={trasfCheck} onChange={handleTrasfFilter}  />} label="con Trasferimento" />
          </FormGroup>
        </Box>
        
        {activeProposals && activeProposals.length > 0 &&
        <Box className="card-div" paddingBottom={"3rem"}>
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
          </Grid>
        </Box>
        }
        

        {/* PROPOSTE ESEGUITE */}
        <Box display={"flex"} flexDirection={"row"} paddingBottom={"1rem"}>
          <Typography variant="h4" textAlign={"left"} marginLeft={"2rem"} marginRight={"1rem"} fontFamily={"sans-serif"} sx={{ cursor: 'default' }}> Proposte eseguite</Typography>
          <FormGroup sx={{ border: "0.2rem solid", borderRadius: "1rem", padding: "1rem", paddingTop: "0rem", paddingBottom: "0rem"}} row>
            <FormControlLabel control={<Checkbox  checked={approvedCheck} onChange={handleApprovedFilter}  />} label="approvate" />
            <FormControlLabel control={<Checkbox  checked={rejectedCheck} onChange={handleRejectedFilter}  />} label="respinte" />
          </FormGroup>
        </Box>

        
        { executedProposals && executedProposals.length > 0 &&
        <Box className="card-div" paddingBottom={"3rem"}>
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
        }

    </>
    }

      <Loader loading={isLoading}/>
    </>
  );
}
