import { defineConfig, createSystem, defaultConfig } from "@chakra-ui/react";

const basicTheme = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: { value: "#00897b" },
        secondary: { value: "#42a5f5" },
        accent: { value: "#ffb300" },
        danger: { value: "#e53935" },
        success: { value: "#43a047" },
        background: { value: "#f5f5f5" },
        text: { value: "#000000" },
      },
      fonts: {
        heading: { value: "'Montserrat', sans-serif" },
        body: { value: "'Roboto', sans-serif" },
        mono: { value: "'Fira Mono', monospace" },
        cursive: { value: "'Lucida Handwriting','Brush Script MT'" },
      },
      fontSizes: {
        xs: { value: "0.75rem" },
        sm: { value: "0.875rem" },
        md: { value: "1rem" },
        lg: { value: "1.125rem" },
        xl: { value: "1.25rem" },
        "2xl": { value: "1.5rem" },
        "3xl": { value: "1.875rem" },
        "4xl": { value: "2.25rem" },
        "5xl": { value: "3rem" },
      },
      breakpoints: {
        sm: { value: "30em" }, // 480px
        md: { value: "48em" }, // 768px
        lg: { value: "62em" }, // 992px
        xl: { value: "80em" }, // 1280px
        "2xl": { value: "96em" }, // 1536px
      },
      radii: {
        none: { value: "0" },
        sm: { value: "0.125rem" },
        md: { value: "0.375rem" },
        lg: { value: "0.5rem" },
        full: { value: "9999px" },
      },
    },
  },
});

const basicSystem = createSystem(defaultConfig, basicTheme);
export default basicSystem;
