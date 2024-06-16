import { Box, Button, Grid, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from 'react';
import Swal from "sweetalert2";
// import { useAppContext } from '../../Context';
import '../../styles/view.css';
import Loader from '../Loader';
import { Proposal } from "../../utilities/interfaces";
import ProposalCard from "../cards/ProposalCard";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NewProposalForm from "../forms/NewProposalForm";
import { EMPTY_PROPOSAL, createProposal, readProposals, vote } from "../../utilities/DAOBridge";
import { useAppContext } from "../../Context";
import { Role } from "../../utilities/Role";
import withReactContent from "sweetalert2-react-content";

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
      console.log("Errore durante il recupero delle proposte");
    }
  }

    // function release() {
  //   Swal.fire({
  //     title: 'Inserisci i dettagli del numero dal rilasciare',
  //     html: swalReleaseContent,
  //     focusConfirm: false,
  //     confirmButtonColor: "#3085d6",
  //     showCloseButton: true,
  //     showCancelButton: true,
  //     preConfirm: () => ({
  //       cover: (document.getElementById('cover') as HTMLInputElement).value,
  //       content: (document.getElementById('content') as HTMLInputElement).value,
  //       summary: (document.getElementById('summary') as HTMLTextAreaElement).value,
  //     }),
  //   }).then(async (result) => {
  //     if(result.isConfirmed){
  //       let coverURL = result.value.cover.trim();
  //       let contentURL = result.value.content.trim();
  //       let summary = result.value.summary.trim();
  //       if(inputValidation(coverURL, contentURL, summary)){
  //         setIsLoading(true);
  //         const success = await releaseMagazine(address);
  //         if(success){
  //           await saveReleasedMagazine( coverURL, contentURL, summary );
  //           Swal.fire({
  //             title: "Nuovo magazine",
  //             text: "La richiesta di rilascio è avvenuta con successo!\n\n per favore attendi l'elaborazione del nuovo magazine.",
  //             icon: "success",
  //             confirmButtonColor: "#3085d6",
  //           });
  //           console.log("Magazine " + address + " rilasciato con successo");
  //         }else{
  //           console.log("Magazine non rilasciato");
  //         }
  //       } else {
  //         swalError(ErrorMessage.IO, Action.RELEASE_MAG)
  //       }
  //     }

  //   });
    
  //   console.log("release magazine: " + address);
  // }

  // function read(){
  //   const pdfUrl = content;
  //   const cid = content.split("?")[0];
  //   const name = content.split("?")[1];
  //   console.log("opening " + cid + " filename: " + name);
  //   if(pdfUrl.includes(IPFSBaseUrl)){
  //     window.open(pdfUrl, "_blank");
  //   } else {
  //     swalError(ErrorMessage.RD, Action.ADD_ADMIN);
  //   }
  // }

  // async function saveReleasedMagazine(cover: string, content: string, summary: string){
  //   //Firebase data
  //   const findResult = await findMagazine(address);
  //   if(findResult.exists()){
  //     await updateMagazine(address, cover, content, summary)
  //     setIsLoading(false);
  //   }
  // }

  // const inputValidation = (cover: string, content: string, summary: string) => {
  //   const isValidUrl = (url: string) => url !== "" && url.includes(IPFSBaseUrl) && url.includes("?filename");
  //   return isValidUrl(cover) && isValidUrl(content) && summary !== "";
  // }

  // function copyToClipboard(){
  //   setCopied(true);
  //   navigator.clipboard.writeText(address);
  //   setTimeout(() => {
  //     setCopied(false)
  //   }, 2000)
  // }

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
          text: "La richiesta di inserimento è avvenuta con successo!\n\n per favore attendi l'elaborazione del nuova proposta.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.log("");
    }
  }

  function newProposal() {
    MySwal.fire({
      title: "Nuova proposta",
      html: <NewProposalForm handleSubmit={handleSubmit}/>,
      showConfirmButton: false,
      showCloseButton: true,
    });
    // .then(async (result) => {
    //   //Controllo sul result
    //   if (result.value !== "" && result.isConfirmed) {
    //     setIsLoading(true);

    //     const success = await createProposal(result.value);
    //     setIsLoading(false);
    //     if(success){
    //       Swal.fire({
    //         title: "Nuova proposta",
    //         text: "La richiesta di inserimento è avvenuta con successo!\n\n per favore attendi l'elaborazione del nuova proposta.",
    //         icon: "success",
    //         confirmButtonColor: "#3085d6",
    //       });
    //     } else {
    //       console.log("Proposta non inserita");
    //     }
    //   }
    // })
  }

  async function voteProposal(proposalAddress: string, support: boolean, abstain: boolean){
    try {
      setIsLoading(true);
      await vote(proposalAddress, support, abstain);
      setIsLoading(false);
    } catch (error) {
      console.log("Error during voting operation");
    }
  }

  async function execute(proposalAddress: string){
    try {
      setIsLoading(true);
      await execute(proposalAddress);
      setIsLoading(false);
    } catch (error) {
      console.log("Error during voting operation");
    }
  }
  // const handleSearch = (event: any) => {
  //   let magazine_address = event.target.address.value.trim();
  //   if(addressValidation(magazine_address)){
  //     setIsLoading(true);
  //     readMagazineByAddress(magazine_address).then((magazines) => {
  //       if(magazines.length > 0){
  //         setSearchedMagazine(magazines[0]);
  //       } else {
  //         Swal.fire("Nessun magazine trovato", "info");
  //       }
  //       setIsLoading(false);
  //     });
  //   } else {
  //     swalError(ErrorMessage.IO, Action.SRC_ADDR_MAG);    
  //   }
  //   event.preventDefault();
  // }

  // const handleClear = () => {
  //   setSearchedMagazine(emptyMagazine);
  // }

  return (
    

    <>
      {/* PROPOSTE ATTIVE */}
      <Typography variant="h4" textAlign={"left"} marginLeft={"2rem"} fontFamily={"sans-serif"} sx={{ cursor: 'default' }}> Proposte da valutare </Typography>
      <Box className="card-div" paddingBottom={"2rem"}>
        <Grid container spacing={isMobile ? 4 : 2} sx={{ margin: "1rem" }}>
          {activeProposals?.map(el =>
            <Grid height={"100%"} item key={el.title} xs={6} md={4} xl={3}>
              <ProposalCard
                proposal={el}
                handleVote={voteProposal}
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

      {/* PROPOSTE ESEGUITE */}
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

      {/* RICERCA */}
      {/* <Typography className='anta-regular' variant="h3" textAlign={"center"} sx={{ cursor: 'default' }}> Ricerca per indirizzo </Typography>
      <SearchForm handleSearch={handleSearch} handleClear={handleClear}/>
      <div id="found-card" className="found-card-div">
          {searchedProposal !== emptyMagazine &&
                  <ComplexCard
                      magazine={searchedProposal}
                      singlePrice={0.00}
                      owned={true}/>
          }
      </div> */}

      <Loader loading={isLoading}/>
    </>
  );
  
}