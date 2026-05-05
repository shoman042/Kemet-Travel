tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-error-container": "#93000a",
        "secondary-container": "#f1f1f1",
        "surface": "#faf9f6",
        "tertiary-fixed-dim": "#ffb68d",
        "primary-fixed": "#ffdea5",
        "tertiary-container": "#632902",
        "on-surface": "#1a1c1a",
        "on-surface-variant": "#4e4639",
        "on-tertiary-fixed": "#331200",
        "on-secondary": "#ffffff",
        "surface-tint": "#775a19",
        "outline-variant": "#d1c5b4",
        "on-tertiary": "#ffffff",
        "surface-container-highest": "#e3e2e0",
        "on-tertiary-container": "#642a00",
        "inverse-surface": "#2f312f",
        "on-background": "#1a1c1a",
        "on-secondary-fixed-variant": "#6a480e",
        "on-error": "#ffffff",
        "primary": "#775a19",
        "secondary-fixed-dim": "#9ccdea",
        "primary-fixed-dim": "#e9c176",
        "surface-container-high": "#e9e8e5",
        "surface-variant": "#e3e2e0",
        "on-primary-fixed-variant": "#5d4201",
        "on-primary-container": "#4e3700",
        "surface-bright": "#faf9f6",
        "on-secondary-container": "#6a480e",
        "secondary-fixed": "#c2e8ff",
        "on-primary-fixed": "#261900",
        "background": "#faf9f6",
        "outline": "#7f7667",
        "error": "#ba1a1a",
        "tertiary-fixed": "#ffdbc9",
        "secondary": "#6a480e",
        "primary-container": "#c5a059",
        "surface-dim": "#dbdad7",
        "on-tertiary-fixed-variant": "#763300",
        "inverse-on-surface": "#f1f1ee",
        "tertiary": "#9b4500",
        "inverse-primary": "#e9c176",
        "surface-container-low": "#f4f3f1",
        "on-primary": "#ffffff",
        "error-container": "#ffdad6",
        "surface-container": "#efeeeb",
        "surface-container-lowest": "#ffffff",
        "on-secondary-fixed": "#6a480e"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        "margin-mobile": "20px",
        "stack-sm": "16px",
        "stack-lg": "64px",
        "margin-desktop": "80px",
        "base": "8px",
        "gutter": "24px",
        "container-max": "1280px",
        "stack-md": "32px"
      },
      fontFamily: {
        h3: ["Noto Serif"],
        h2: ["Noto Serif"],
        "body-md": ["Plus Jakarta Sans"],
        h1: ["Noto Serif"],
        "body-lg": ["Plus Jakarta Sans"],
        "label-caps": ["Plus Jakarta Sans"]
      },
      fontSize: {
        h3: ["28px", { lineHeight: "1.4", fontWeight: "600" }],
        h2: ["36px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        h1: ["48px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "1.0", letterSpacing: "0.1em", fontWeight: "700" }]
      }
    }
  }
};
