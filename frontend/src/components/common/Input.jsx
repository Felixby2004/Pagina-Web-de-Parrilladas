import { TextField } from '@mui/material';

export const Input = ({ label, name, register, errors, ...props }) => {
  return (
    <TextField
      label={label}
      fullWidth
      margin="normal"
      {...register(name)}
      error={!!errors?.[name]}
      helperText={errors?.[name]?.message}
      {...props}
    />
  );
};