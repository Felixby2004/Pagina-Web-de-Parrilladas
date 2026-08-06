import { useState } from 'react';
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export const PasswordInput = ({
  label,
  name,
  register,
  error,
  helperText,
  required = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleToggle = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <FormControl fullWidth margin="normal" error={!!error}>
      <InputLabel htmlFor={name} required={required}>
        {label}
      </InputLabel>
      <OutlinedInput
        id={name}
        label={label}
        type={showPassword ? 'text' : 'password'}
        {...register(name)}
        {...props}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleToggle}
              edge="end"
              sx={{ color: 'text.secondary' }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};