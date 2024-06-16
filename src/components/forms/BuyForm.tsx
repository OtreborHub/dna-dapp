import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useAppContext } from '../../Context';
import { BuyFormProps } from '../../utilities/interfaces';
import { ethers } from 'ethers';


export default function BuyForm ({ buyType, handleSubmit, handleChange, balance, DNABalance, currentSupply } : BuyFormProps) {
  const [inputValue, setInputValue] = useState<number>(1);
  const appContext = useAppContext();

  const change = (event: any) => {
    const value = handleChange(event.target.value, buyType);
    setInputValue(value);
  };

  const submit = (event: any) => {
    event.preventDefault();
    handleSubmit(inputValue, buyType);
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ p: 2 }}>
      <Typography variant="body1" gutterBottom>
        {buyType === "DNA" && 
        "Scegli una quantità in wei da trasformare in DNA!"
        }
        {buyType === "Shares" && 
        "Scegli una quantità in DNA da trasformare in Shares!"
        }
        {buyType === "Approve" && 
        "Scegli una quantità in DNA da approvare per l'acquisto di Shares!"
        }
      </Typography>
      <TextField
        type="number"
        placeholder={buyType === "DNA" ? 
          "Max " + currentSupply + " DNA" : 
          buyType === "Shares" ? 
          "Max " + appContext.DNABalance + " Shares" : 
          "Max " + appContext.DNABalance + " DNA"}
        value={inputValue}
        onChange={change}
        fullWidth
        margin="normal"
        id="range-value"
        label="Quantità (in DNA)"
      />
      <Box mt={2}>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Conferma
        </Button>
      </Box>
    </Box>
  );
};