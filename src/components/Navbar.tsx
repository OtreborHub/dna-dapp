import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../Context';
import logo from '../assets/logo.svg';
import { formatNumberAddress } from '../utilities/helper';
import { NavbarProps } from '../utilities/interfaces';
import DropdownMenu from './Menu';

export default function Navbar({connect: connectWallet}: NavbarProps) {
  const appContext = useAppContext();
  return (
    <Box sx={{ flexGrow: 1, borderBottom: "2px solid"}}>
      <AppBar color='default' position="static">
        <Toolbar>
          <img src={logo} alt="Logo" style={{ maxHeight: '50px', marginRight: '10px' }}/>
          { appContext.provider && appContext.signer && appContext.balance ?
          <>
            <Typography variant="body1" component="div" color="#e0e012" sx={{ flexGrow: 1 }}>
              <DropdownMenu connect={connectWallet}/>
            </Typography>
          
            <Box textAlign={"center"}>
              <Typography variant="body1" mr="0.2rem" component="div" sx={{ flexGrow: 1 }}>
                Address {formatNumberAddress(appContext.signer)}
              </Typography>
              <Typography variant="body1" component="div" sx={{ flexGrow: 1 }}>
                Balance { (appContext.DNABalance) } DNA             
              </Typography>
            </Box> 
          </> 
          : <w3m-button loadingLabel='loading' />
        }
        </Toolbar>
      </AppBar>
    </Box>
  );
}