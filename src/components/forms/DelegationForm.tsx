import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { DelegationFormProps } from '../../utilities/interfaces';
import { Action } from '../../utilities/actions';


export default function SimpleForm({ delegationType, handleSubmitDelegation }: DelegationFormProps) {
  const [inputValue, setInputValue] = useState<string>('');

  const change = (event: any) => {
    setInputValue(event.target.value);
  };

  const submit = (event: any) => {
    event.preventDefault();
    handleSubmitDelegation(inputValue, delegationType);
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ p: 2 }}>
      <Typography variant="body1" gutterBottom>
        {delegationType === Action.DELEGATE_MEMBER &&
        "Inserisci l'indirizzo del membro a cui delegare il voto"
        }
        {delegationType === Action.REVOKE_DELEGATE &&
        "Inserisci l'indirizzo del membro da cui rimuovere la delega del voto."
        }
      </Typography>
      <TextField
        type="text"
        placeholder="0x..."
        value={inputValue}
        onChange={change}
        fullWidth
        margin="normal"
        id="text-input"
        label="Indizzo di delega"
      />
      <Box mt={2}>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Conferma
        </Button>
      </Box>
    </Box>
  );
};