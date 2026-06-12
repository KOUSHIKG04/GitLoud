import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to GitLoud to generate and save GitHub content.",
  robots: {
    index: false,
    follow: false,
  },
};

export { default } from "./[...sign-in]/page";
