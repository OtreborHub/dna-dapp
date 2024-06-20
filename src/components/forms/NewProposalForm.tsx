import Box from '@mui/material/Box/Box';
import Button from '@mui/material/Button/Button';
import Checkbox from '@mui/material/Checkbox/Checkbox';
import FormControl from '@mui/material/FormControl/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Grid from '@mui/material/Grid/Grid';
import InputLabel from '@mui/material/InputLabel/InputLabel';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import Select from '@mui/material/Select/Select';
import TextField from '@mui/material/TextField/TextField';
import { useState } from 'react';
import "../../styles/form.css";
import { ProposalFormProps } from '../../utilities/interfaces';

export default function NewProposalForm ({ handleSubmit }: ProposalFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    recipient: "",
    amount: 0,
    currency: "wei",
    isTransferChecked: false
  });

  const handleChange = (event: any) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const submit = (event : any) => {
    event.preventDefault();
    handleSubmit(formData.title, formData.description, formData.recipient, formData.amount);
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ p: 2 }}>
      <TextField
        fullWidth
        margin="normal"
        id="title"
        name="title"
        label="Titolo"
        value={formData.title}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        id="description"
        name="description"
        label="Descrizione"
        multiline
        rows={4}
        value={formData.description}
        onChange={handleChange}
      />
      <FormControlLabel
        control={
          <Checkbox
            name="isTransferChecked"
            checked={formData.isTransferChecked}
            onChange={handleChange}
          />
        }
        label="Trasferisci denaro"
      />
      <TextField
        fullWidth
        margin="normal"
        name="recipient"
        label="Indirizzo del trasferimento"
        placeholder="Indirizzo del trasferimento"
        value={formData.recipient}
        onChange={handleChange}
        disabled={!formData.isTransferChecked}
      />
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={9}>
          <TextField
            fullWidth
            type="number"
            id="amount"
            name="amount"
            label="Quantità"
            placeholder="Quantità"
            value={formData.amount}
            onChange={handleChange}
            disabled={!formData.isTransferChecked}
          />
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth disabled={!formData.isTransferChecked}>
            <InputLabel id="currency-label">Valuta</InputLabel>
            <Select
              labelId="currency-label"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
            <MenuItem value="wei">DNA</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Box mt={2}>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Inserisci proposta
        </Button>
      </Box>
    </Box>
  );
};