"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type InputOTPContextValue = {
  disabled?: boolean;
  maxLength: number;
  onChange: (value: string) => void;
  value: string;
};

const InputOTPContext = React.createContext<InputOTPContextValue | null>(null);

function InputOTP({
  children,
  className,
  disabled,
  maxLength,
  onChange,
  value,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  maxLength: number;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <InputOTPContext.Provider
      value={{ disabled, maxLength, onChange, value }}
    >
      <div
        data-slot="input-otp"
        className={cn("flex items-center gap-2", className)}
      >
        {children}
      </div>
    </InputOTPContext.Provider>
  );
}

function InputOTPGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  className,
  index,
}: {
  className?: string;
  index: number;
}) {
  const context = React.useContext(InputOTPContext);
  const inputRef = React.useRef<HTMLInputElement>(null);

  if (!context) {
    throw new Error("InputOTPSlot must be used within InputOTP");
  }

  const { disabled, maxLength, onChange, value } = context;

  function updateValue(nextCharacter: string) {
    const buffer = Array(maxLength).fill("");
    for (let i = 0; i < value.length && i < maxLength; i++) {
      buffer[i] = value[i];
    }
    buffer[index] = nextCharacter;
    onChange(buffer.join("").slice(0, maxLength));
  }

  return (
    <input
      ref={inputRef}
      data-slot="input-otp-slot"
      aria-label={`Verification code digit ${index + 1}`}
      autoComplete="one-time-code"
      className={cn(
        "flex size-10 items-center justify-center border border-input bg-background text-center text-base font-medium text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      disabled={disabled}
      inputMode="numeric"
      maxLength={1}
      onChange={(event) => {
        const nextCharacter = event.target.value.replace(/\D/g, "").slice(-1);
        updateValue(nextCharacter);

        if (nextCharacter) {
          const nextInput = inputRef.current?.nextElementSibling;
          if (nextInput instanceof HTMLInputElement) {
            nextInput.focus();
          }
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Backspace" && !value[index]) {
          const previousInput = inputRef.current?.previousElementSibling;
          if (previousInput instanceof HTMLInputElement) {
            previousInput.focus();
          }
        }
      }}
      onPaste={(event) => {
        event.preventDefault();
        const pastedText = event.clipboardData
          .getData("text")
          .replace(/\D/g, "");
        const buffer = Array(maxLength).fill("");
        for (let i = 0; i < value.length && i < maxLength; i++) {
          buffer[i] = value[i];
        }
        for (let i = 0; i < pastedText.length && index + i < maxLength; i++) {
          buffer[index + i] = pastedText[i];
        }
        onChange(buffer.join("").slice(0, maxLength));
      }}
      value={value[index] ?? ""}
    />
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot };
