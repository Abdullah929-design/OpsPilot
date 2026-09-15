import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1E3A8A" },
    secondary: { main: "#0EA5E9" },
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

export default theme;