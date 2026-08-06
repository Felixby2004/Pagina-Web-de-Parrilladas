import { Skeleton as MuiSkeleton } from '@mui/material';
import { Box } from '@mui/material';

export const Skeleton = ({ count = 1, ...props }) => {
  return (
    <Box>
      {Array.from({ length: count }).map((_, i) => (
        <MuiSkeleton key={i} {...props} />
      ))}
    </Box>
  );
};