import { Dropdown } from '@mui/base/Dropdown';
import { Menu } from '@mui/base/Menu';
import { MenuButton as BaseMenuButton } from '@mui/base/MenuButton';
import { MenuItem as BaseMenuItem, menuItemClasses } from '@mui/base/MenuItem';
import { styled } from '@mui/system';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useAppContext } from '../Context';
import { activeSale, buyShares, endSale } from '../utilities/DAOBridge';
import { approveDNAToken, buyDNAToken, readAllowance, readCurrentSupply } from '../utilities/DNABridge';
import { ErrorMessage, swalError } from '../utilities/Error';
import { Role } from '../utilities/Role';
import { Action } from '../utilities/actions';
import { NavbarProps } from '../utilities/interfaces';
import Loader from './Loader';
import withReactContent from 'sweetalert2-react-content';
import BuyForm from './forms/BuyForm';
import { formatWeiBalance } from '../utilities/helper';

export default function DropdownMenu({ connect: connectWallet }: NavbarProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasDelegation, setHasDelegation] = useState<boolean>(false);
  const [currentSupply, setCurrentSupply] = useState<number>(0);
  const appContext = useAppContext();
  const MySwal = withReactContent(Swal);


  useEffect(() => {
    getCurrentSupply();
  })

  async function getCurrentSupply() {
    try {
      const supply = await readCurrentSupply();
      setCurrentSupply(supply ? supply : 0);
    } catch (error) {
      console.log("Error while reading contract data");
    }
  }
    
  async function endSharesSale(){
    try {
      const success = await endSale();
      if(success){
        Swal.fire({
          title: "Periodo di vendita terminato",
          icon: "success",
          confirmButtonColor: "#3085d6"
        })
      }
    } catch (error) {
      console.log("Error during endSale action");
    }
  }

  async function activeSharesSale(){
    try {
      const success = await activeSale();
      if(success){
        Swal.fire({
          title: "Periodo di vendita terminato",
          icon: "success",
          confirmButtonColor: "#3085d6"
        })
      }
    } catch (error) {
      console.log("Error during endSale action");
    }
  }


  function delegateMember() {
  //   let minWithdraw = 0.000001;
  //   let balance = parseFloat(ethers.formatEther(appContext.contractBalance));
  //   if (balance === 0 || balance < minWithdraw) {
  //     swalError(ErrorMessage.IF, Action.SPLIT_PROFIT);
  //   }
  //   else {
  //     Swal.fire({
  //       title: "Dividi Profitto",
  //       text: "Proseguendo dividerai il bilancio del contratto con i tuoi collaboratori, sei sicuro?",
  //       confirmButtonColor: "#3085d6",
  //       showCancelButton: true,
  //       showCloseButton: true
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         setIsLoading(true);
  //         const success = await splitProfit();
  //         setIsLoading(false);
  //         if(success) {
  //           Swal.fire({
  //             title: "Split profit avvenuto con successo!",
  //             text: "",
  //             icon: "success",
  //             confirmButtonColor: "#3085d6"
  //           });
  //         } else {
  //           console.log("Errore durante l'azione di splitProfit");
  //         }
  //       }
  //     })
  //   }
  }

  function changeDelegateMember() {
    // Swal.fire({
    //   title: "Aggiungi admin",
    //   input: "text",
    //   text: "Inserisci l'indirizzo del wallet da aggiungere come admin",
    //   inputPlaceholder: "Address 0x00...",
    //   confirmButtonColor: "#3085d6",
    //   showCancelButton: true,
    //   showCloseButton: true
    // }).then(async (result) => {
    //   if (result.isConfirmed) {
    //     if(addressValidation(result.value)){
    //       setIsLoading(true);
    //       const success = await addAdministrator(result.value);
    //       setIsLoading(false);
    //       if(success){
    //         Swal.fire({
    //           title: "Admin aggiunto con successo!", 
    //           text: "", 
    //           icon: "success",
    //           confirmButtonColor: "#3085d6"
    //         });
    //       } else {
    //         console.log("Errore durante l'azione di aggiunta admin");
    //       }
    //     } else {
    //       swalError(ErrorMessage.IO, Action.ADD_ADMIN);
    //     }
    //   } 
    // })
  }

  function revokeDelegation() {
    // if (appContext.balance > 0) {
    //   Swal.fire({
    //     title: "Aspetta...",
    //     text: "Sei sicuro di voler revocare l'abbonamento? :(",
    //     icon: "question",
    //     confirmButtonColor: "#3085d6",
    //     showCancelButton: true,
    //     showCloseButton: true
    //   }).then(async (result) => {
    //     if (result.isConfirmed) {
    //       setIsLoading(true);
    //       const success = await revokeSubscription();
    //       setIsLoading(false);
    //       if(success){
    //         Swal.fire({
    //           title: "A presto!",
    //           text: "La revoca dell'abbonamento è stata effettuata.",
    //           icon: "success",
    //           confirmButtonColor: "#3085d6"
    //         });
    //       } else {
    //         console.log("Errore durante l'azione di revoca abbonamento");
    //       }
    //     }
    //   })
    // } else {
    //   swalError(ErrorMessage.IF);
    // }
  }

	async function handleSubmit(amount: number, buyType: string) {
		let success;
		setIsLoading(true);
		if(buyType === "DNA"){
			success = await buyDNAToken(amount);
		} else if (buyType === "Shares"){
			success = await buyShares(amount);
		} else if (buyType === "Approve") {
      success = await approveDNAToken(amount);
    }
		setIsLoading(false);
		if(success){
			Swal.fire({
				icon: "success",
				title: buyType === "Approve" ? "Richiesta di approvazione effettuata!" : "Richiesta di acquisto effettuata!",
				text: "L'elaborazione della richiesta avverrà tra qualche secondo.\n\nPer OK Per continuare.",
				showCloseButton: true,
				showConfirmButton: true,
				confirmButtonColor: "#3085d6",
			});
		} else {
			console.log("Errore durante l'operazione di acquisto " + buyType);
		}
	}

	function handleChange(amount: number, buyType: string) {
		const { balance, DNABalance, allowance } = appContext;
		const weiBalance = formatWeiBalance(balance);

		if (buyType === "Shares" && amount >= DNABalance) {
			return appContext.DNABalance;
		} else if (buyType === "DNA" && amount >= weiBalance && weiBalance <= currentSupply) {
			return weiBalance;
		} else if (buyType === "DNA" && amount >= currentSupply && weiBalance >= currentSupply) {
			return currentSupply;
		} else if (buyType === "Approve" && amount >= DNABalance) {
			return DNABalance;
		} else if (buyType === "Shares" && amount >= allowance){
			return allowance;
		} else {
			return amount;
		}
	}

	function buyDNA() {
		if (appContext.balance > 0) {
			MySwal.fire({
				title: "Acquisto DNA",
				icon: "question",
				html: <BuyForm handleSubmit={handleSubmit} handleChange={handleChange} buyType="DNA" currentSupply={currentSupply} balance={formatWeiBalance(appContext.balance)} />,
				showConfirmButton: false,
				showCloseButton: true,
			})
		} else {
			swalError(ErrorMessage.IF);
		}
	}

	function buyDNAShares() {
		if (appContext.DNABalance > 0) {
			MySwal.fire({
				title: "Acquista DNA Shares",
				icon: "question",
				html: <BuyForm handleSubmit={handleSubmit} handleChange={handleChange} buyType="Shares" DNABalance={appContext.DNABalance} />,
				showConfirmButton: false,
				showCloseButton: true,
			})
		} else {
			swalError(ErrorMessage.IF);
		}
	}

	function approveDNA() {
		if (appContext.DNABalance > 0) {
			MySwal.fire({
				title: "Acquista DNA Shares",
				icon: "question",
				html: <BuyForm handleSubmit={handleSubmit} handleChange={handleChange} buyType="Approve" DNABalance={appContext.allowance} />,
				showConfirmButton: false,
				showCloseButton: true,
			})
		} else {
			swalError(ErrorMessage.IF);
		}
	}

	const verifyAllowance = () => {
		return appContext.DNABalance > 0 && appContext.allowance > 0;
	}

	const verifyBalance = () => {
		return appContext.DNABalance > 0 && appContext.DNABalance > appContext.allowance;
	}

  return (
    <>
    <Dropdown>
      <MenuButton>{appContext.role}</MenuButton>

        {appContext.role === Role.VISITOR && 
          <Menu slots={{ listbox: Listbox }}>
              <MenuItem onClick={buyDNA}> Acquista DNA Token </MenuItem>
              { verifyBalance() && 
                <MenuItem onClick={approveDNA}> Approva DNA </MenuItem>
              }
              { verifyAllowance() && 
                <MenuItem onClick={buyDNAShares}> Acquista DNA Shares </MenuItem>
              }
          </Menu>
        }

        {appContext.role === Role.MEMBER &&
          <Menu slots={{ listbox: Listbox }}>
              <MenuItem> {appContext.shares} DNA Shares </MenuItem>
              <MenuItem> {appContext.allowance} DNA Approvati </MenuItem>
              <MenuItem><hr/></MenuItem>
              <MenuItem onClick={buyDNA}> Acquista DNA Token </MenuItem>
              { verifyBalance() && 
                <MenuItem onClick={approveDNA}> Approva DNA </MenuItem>
              }
              { verifyAllowance() && 
                <MenuItem onClick={buyDNAShares}> Acquista DNA Shares </MenuItem>
              }
              <MenuItem><hr/></MenuItem>
              { !hasDelegation && 
                <MenuItem onClick={delegateMember}>Delega membro</MenuItem>
              }
              { hasDelegation && 
                <MenuItem onClick={changeDelegateMember}>Cambia membro delega</MenuItem>
              }
              {/* { hasDelegation && 
                  <MenuItem sx={{ color: "red" }} onClick={() => revokeDelegation()}>Revoca delega</MenuItem>
              } */}
          </Menu>
        }

        {appContext.role === Role.OWNER &&
          <Menu slots={{ listbox: Listbox }}>
              {  appContext.saleActive &&
                <>
                <MenuItem> VENDITA SHARES ATTIVA</MenuItem>
                <MenuItem><hr/></MenuItem>
                <MenuItem onClick={endSharesSale}>Termina vendita shares</MenuItem>
                </>
              }
              {  !appContext.saleActive &&
                <>
                <MenuItem> VENDITA SHARES DISATTIVATA </MenuItem>
                <MenuItem><hr/></MenuItem>
                <MenuItem onClick={activeSharesSale}>Attiva vendita shares</MenuItem>
                </>
              }
              {/* { hasDelegation && 
                  <MenuItem sx={{ color: "red" }} onClick={() => revokeDelegation()}>Revoca delega</MenuItem>
              } */}
          </Menu>
        }
      
    </Dropdown>
    <Loader loading={isLoading} />
    </>
  );
}

const blue = {
  50: '#F0F7FF',
  100: '#C2E0FF',
  200: '#99CCF3',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E6',
  700: '#0059B3',
  800: '#004C99',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const Listbox = styled('ul')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  min-width: 200px;
  border-radius: 12px;
  overflow: auto;
  outline: 0px;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  box-shadow: 0px 4px 6px ${
    theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.50)' : 'rgba(0,0,0, 0.05)'
  };
  z-index: 1;
  `,
);

const MenuItem = styled(BaseMenuItem)(
  ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  user-select: none;

  &:last-of-type {
    border-bottom: none;
  }

  &:focus {
    outline: 3px solid ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
    background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  }

  &.${menuItemClasses.disabled} {
    color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
  }
  `,
);

const MenuButton = styled(BaseMenuButton)(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
  transition: all 150ms ease;
  cursor: pointer;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 2px solid ${grey[700]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

  &:hover {
    background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    border-color: ${blue[600]};
    color: ${blue[600]};
    cursor: pointer;
  }

  &:active {
    background: ${theme.palette.mode === 'dark' ? grey[700] : grey[100]};
  }

  &:focus-visible {
    box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
    outline: none;
  }
  `,
);