import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a GitLoud account to generate and save GitHub content.",
  robots: {
    index: false,
    follow: false,
  },
};

export { default } from "./[...sign-up]/page";
