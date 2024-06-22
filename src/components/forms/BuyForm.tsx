import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Action } from '../../utilities/actions';
import { BuyFormProps } from '../../utilities/interfaces';


export default function BuyForm ({ buyType, handleSubmit, handleChange, DNABalance, currentSupply, tokenPrice } : BuyFormProps) {
  const [inputValue, setInputValue] = useState<number>(1);

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
        {buyType === Action.BUY_DNA && 
        "Scegli una quantità in wei da trasformare in DNA ( " + tokenPrice + " wei per DNA Token)" 
        }
        {buyType === Action.BUY_SHARES && 
        "Scegli una quantità in DNA da trasformare in Shares"
        }
        {buyType === Action.APPROVE_DNA && 
        "Scegli una quantità in DNA da approvare per l'acquisto di Shares"
        }
        {buyType === Action.UPDATE_PRICE && 
        "Scegli il nuovo prezzo per i DNA Token"
        }
      </Typography>
      <TextField
        type="number"
        placeholder={buyType === Action.BUY_DNA ? 
          "Max " + currentSupply + " DNA" : 
          buyType === Action.BUY_SHARES ? 
          "Max " + DNABalance + " Shares" : 
          buyType === Action.APPROVE_DNA ?
          "Max " + DNABalance + " DNA" : 
          buyType === Action.UPDATE_PRICE ?
          "default 1 wei" : ""}
        value={inputValue}
        onChange={change}
        fullWidth
        margin="normal"
        id="range-value"
        label={buyType === Action.BUY_DNA ? 
          "Quantità (in wei)" : 
          buyType === Action.BUY_SHARES || buyType === Action.APPROVE_DNA ? 
          "Quantità (in DNA)" : 
          buyType === Action.UPDATE_PRICE ?
          "Quantità (in wei)" : ""}
      />
      <Box mt={2}>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Conferma
        </Button>
      </Box>
    </Box>
  );
};