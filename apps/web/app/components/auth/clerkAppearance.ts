export const authAppearance = {
  variables: {
    colorPrimary: "oklch(0.795 0.184 86.047)",
    colorBackground: "var(--card)",
    colorInputBackground: "var(--background)",
    colorInputText: "var(--foreground)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorNeutral: "var(--muted-foreground)",
    borderRadius: "0px",
    fontFamily: "var(--font-mono)",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "w-full border border-border bg-card text-card-foreground shadow-none rounded-none",
    headerTitle: "text-foreground text-xl font-semibold tracking-tight",
    headerSubtitle: "text-muted-foreground text-sm",
    socialButtonsBlockButton:
      "rounded-none border-border bg-background text-foreground hover:bg-muted",
    socialButtonsBlockButtonText: "font-medium",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground",
    formFieldLabel: "text-foreground",
    formFieldInput:
      "rounded-none border-input bg-background text-foreground focus:ring-1 focus:ring-ring",
    formButtonPrimary:
      "rounded-none bg-primary text-primary-foreground hover:bg-primary/90 shadow-none",
    footerActionText: "text-muted-foreground",
    footerActionLink: "text-foreground underline-offset-4 hover:underline",
    developmentMode: "hidden",
    developmentModeBadge: "hidden",
    badge: "hidden",
    identityPreview: "rounded-none border-border bg-background",
    identityPreviewText: "text-foreground",
    formResendCodeLink: "text-foreground underline-offset-4 hover:underline",
    otpCodeFieldInput:
      "rounded-none border-input bg-background text-foreground focus:ring-1 focus:ring-ring",
  },
} as const;
