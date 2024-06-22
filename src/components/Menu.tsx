import { Dropdown } from '@mui/base/Dropdown';
import { Menu } from '@mui/base/Menu';
import { MenuButton as BaseMenuButton } from '@mui/base/MenuButton';
import { MenuItem as BaseMenuItem, menuItemClasses } from '@mui/base/MenuItem';
import { styled } from '@mui/system';
import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAppContext } from '../Context';
import { buyShares, delegateVote, disableSale, enableSale, revokeMemberDelegation } from '../utilities/DAOBridge';
import { approveDNAToken, buyDNAToken, updateTokenPrice, token } from '../utilities/DNABridge';
import { ErrorMessage, swalError } from '../utilities/Error';
import { Role } from '../utilities/Role';
import { Action } from '../utilities/actions';
import { formatWeiBalance } from '../utilities/helper';
import { NavbarProps } from '../utilities/interfaces';
import Loader from './Loader';
import BuyForm from './forms/BuyForm';
import DelegationForm from './forms/DelegationForm';

export default function DropdownMenu({ connect: connectWallet }: NavbarProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const appContext = useAppContext();
  const MySwal = withReactContent(Swal);

  async function endSharesSale(){
    try {
      const success = await disableSale();
      if(success){
        Swal.fire({
          title: "Richiesta di disabilitazione vendita Shares",
          text: "La vendita degli Shares sarà disabilitata tra qualche secondo. Premi OK per continuare.",
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
      const success = await enableSale();
      if(success){
        Swal.fire({
          title: "Richiesta di abilitazione vendita Shares",
          text: "La vendita degli Shares sarà disponibile tra qualche secondo. Premi OK per continuare.",
          icon: "success",
          confirmButtonColor: "#3085d6"
        })
      }
    } catch (error) {
      console.log("Error during endSale action");
    }
  }


  function delegateVoteToMember() {
    MySwal.fire({
      title: "Delega Membro",
      icon: "question",
      html: <DelegationForm 
        delegationType={Action.DELEGATE_MEMBER} 
        handleSubmitDelegation={handleSubmitDelegation}/>,
      showConfirmButton: false,
      showCloseButton: true,
    })
  }

  function revokeDelegation() {
    MySwal.fire({
      title: "Revoca Delega Membro",
      icon: "question",
      html: <DelegationForm 
        delegationType={Action.REVOKE_DELEGATE} 
        handleSubmitDelegation={handleSubmitDelegation}/>,
      showConfirmButton: false,
      showCloseButton: true,
    })
  }

  function buyDNA() {
		if (appContext.balance > 0) {
			MySwal.fire({
				title: "Acquista DNA Token",
				icon: "question",
				html: <BuyForm 
          buyType={Action.BUY_DNA} 
          handleSubmit={handleSubmit} 
          handleChange={handleChange} 
          currentSupply={appContext.currentSupply}
          tokenPrice={appContext.tokenPrice} />,
				showConfirmButton: false,
				showCloseButton: true,
			})
		} else {
			swalError(ErrorMessage.IF, Action.BUY_DNA);
		}
	}

	function approveDNA() {
		if (appContext.DNABalance > 0) {
			MySwal.fire({
				title: "Approva DNA Token",
				icon: "question",
				html: <BuyForm 
          buyType={Action.APPROVE_DNA} 
          handleSubmit={handleSubmit} 
          handleChange={handleChange} 
          DNABalance={appContext.allowance} />,
				showConfirmButton: false,
				showCloseButton: true,
			})
		} else {
			swalError(ErrorMessage.IF, Action.APPROVE_DNA);
		}
	}

  function buyDNAShares() {
		if (appContext.allowance > 0) {
			MySwal.fire({
				title: "Acquista DNA Shares",
				icon: "question",
				html: <BuyForm 
          buyType={Action.BUY_SHARES} 
          handleSubmit={handleSubmit} 
          handleChange={handleChange} 
          DNABalance={appContext.DNABalance} />,
				showConfirmButton: false,
				showCloseButton: true,
			})
		} else {
			swalError(ErrorMessage.IF, Action.BUY_SHARES);
		}
	}

  function updateDNAPrice(){
    if(appContext.role === Role.OWNER){
      MySwal.fire({
				title: "Varia prezzo DNA Token",
				icon: "question",
				html: <BuyForm 
          buyType={Action.UPDATE_PRICE} 
          handleSubmit={handleSubmit} 
          handleChange={handleChange} 
          DNABalance={appContext.DNABalance} />,
				showConfirmButton: false,
				showCloseButton: true,
			})
		} else {
			swalError(ErrorMessage.IF, Action.UPDATE_PRICE);
		}
  }

	async function handleSubmit(amount: number, buyType: string) {
		let success;
		setIsLoading(true);
		if(buyType === Action.BUY_DNA){
			success = await buyDNAToken(amount);
		} else if (buyType === Action.BUY_SHARES) {
			success = await buyShares(amount);
		} else if (buyType === Action.APPROVE_DNA) {
      success = await approveDNAToken(amount);
    } else if (buyType === Action.UPDATE_PRICE){
      success = await updateTokenPrice(amount);
    }
		setIsLoading(false);
		if(success){
			Swal.fire({
				icon: "success",
				title: buyType === Action.APPROVE_DNA ? "Richiesta di approvazione effettuata" : buyType === Action.UPDATE_PRICE ? "Richiesta di aggiornamento effettuata" : "Richiesta di acquisto effettuata",
				text: "L'elaborazione della richiesta avverrà tra qualche secondo. Per OK Per continuare.",
				showCloseButton: true,
				showConfirmButton: true,
				confirmButtonColor: "#3085d6",
			});
		} else {
			console.log("Error during operation : " + buyType);
		}
	}

	function handleChange(amount: number, buyType: string) {
		const { balance, DNABalance, allowance, currentSupply } = appContext;
		const weiBalance = formatWeiBalance(balance);

		if (buyType === Action.BUY_SHARES && amount >= DNABalance) {
			return appContext.DNABalance;
		} else if (buyType === Action.BUY_DNA && amount >= weiBalance && weiBalance <= currentSupply) {
			return weiBalance;
		} else if (buyType === Action.BUY_DNA && amount >= currentSupply && weiBalance >= currentSupply) {
			return currentSupply;
    } else if (buyType === Action.BUY_SHARES && amount >= allowance){
			return allowance;
		} else if (buyType === Action.APPROVE_DNA && amount >= DNABalance) {
			return DNABalance;
    } else {
			return amount;
		}
	}

  async function handleSubmitDelegation(delegateAddress: string, delegationType: string){
    let success;
    setIsLoading(true);
    if(delegationType === Action.DELEGATE_MEMBER){
      success = await delegateVote(delegateAddress);
    } else if (delegationType === Action.REVOKE_DELEGATE){
      success = await revokeMemberDelegation(delegateAddress);
    }
    setIsLoading(false);
		if(success){
			Swal.fire({
				icon: "success",
				title: delegationType === Action.DELEGATE_MEMBER ? "Richiesta di delega effettuata!" : "Richiesta di revoca delega effettuata!",
				text: "L'elaborazione della richiesta avverrà tra qualche secondo.\n\nPer OK Per continuare.",
				showCloseButton: true,
				showConfirmButton: true,
				confirmButtonColor: "#3085d6",
			});
		} else {
			console.log("Error during delegation operation: " + delegationType);
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
              <MenuItem> {appContext.DNABalance} DNA Token</MenuItem>
              <MenuItem> {appContext.allowance} DNA Token Approvati </MenuItem>
              <MenuItem><hr/></MenuItem>
              <MenuItem onClick={buyDNA}> Acquista DNA Token </MenuItem>
              { verifyBalance() && 
                <MenuItem onClick={approveDNA}> Approva DNA </MenuItem>
              }
              { verifyAllowance() && 
                <MenuItem onClick={buyDNAShares}> Acquista DNA Shares </MenuItem>
              }
              <MenuItem><hr/></MenuItem>
              <MenuItem onClick={delegateVoteToMember}>Delega membro</MenuItem>
              <MenuItem onClick={revokeDelegation}>Revoca delega</MenuItem>
          </Menu>
        }

        {appContext.role === Role.OWNER &&
          <Menu slots={{ listbox: Listbox }}>
              {  appContext.saleActive &&
                <>
                <MenuItem> Vendita DNA Shares ATTIVA</MenuItem>
                <MenuItem><hr/></MenuItem>
                <MenuItem onClick={endSharesSale}>Termina vendita shares</MenuItem>
                </>
              }
              {  !appContext.saleActive &&
                <>
                <MenuItem> Vendita DNA Shares DISATTIVATA </MenuItem>
                <MenuItem><hr/></MenuItem>
                <MenuItem onClick={activeSharesSale}>Attiva vendita shares</MenuItem>
                </>
              }
              {
                !appContext.saleActive &&
                <MenuItem onClick={updateDNAPrice}>Aggiorna prezzo DNA Shares</MenuItem>
              }
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