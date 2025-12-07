import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      utilities: {
        ".field-sizing-content": {
          fieldSizing: "content",
        },
      },
    },
  },
  plugins: [],
};
export default config;
