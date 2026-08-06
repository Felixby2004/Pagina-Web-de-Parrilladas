import { Card, CardContent, Box, Typography, Skeleton } from "@mui/material";

export const KpiCard = ({
  title,
  value,
  icon,
  color,
  bgColor,
  loading = false,
}) => {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,.06)",
        transition: "all .25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 40px rgba(0,0,0,.12)",
        },
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: 2.5,
        }}
      >
        {/* Título + Icono */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: {
                xs: "0.85rem",
                sm: "0.9rem",
                md: "1rem",
              },
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              width: {
                xs: 42,
                sm: 48,
                md: 56,
              },
              height: {
                xs: 42,
                sm: 48,
                md: 56,
              },
              borderRadius: "50%",
              bgcolor: bgColor || "rgba(0,0,0,.05)",
              color: color,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,

              "& svg": {
                fontSize: {
                  xs: 22,
                  sm: 26,
                  md: 30,
                },
              },
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Número */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "flex-end",
            mt: 2,
          }}
        >
          {loading ? (
            <Skeleton width={120} height={45} />
          ) : (
            <Typography
              sx={{
                fontWeight: 700,
                lineHeight: 1,
                wordBreak: "break-word",
                fontSize: {
                  xs: "1.8rem",
                  sm: "2rem",
                  md: "2.3rem",
                  lg: "2.6rem",
                },
              }}
            >
              {value}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};