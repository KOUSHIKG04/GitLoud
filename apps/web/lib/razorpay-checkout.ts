const RAZORPAY_SCRIPT_SRC =
  "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_SCRIPT_TIMEOUT_MS = 15_000;

let inFlightPromise: Promise<void> | null = null;

export function loadRazorpayScript() {
  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`,
    );
    const script = existingScript ?? document.createElement("script");
    const removeScript = () => script.remove();
    const timeout = window.setTimeout(() => {
      removeScript();
      reject(new Error("Razorpay checkout script timed out"));
    }, RAZORPAY_SCRIPT_TIMEOUT_MS);

    script.onload = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      removeScript();
      reject(new Error("Could not load Razorpay checkout"));
    };

    if (!existingScript) {
      script.src = RAZORPAY_SCRIPT_SRC;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    }
  }).finally(() => {
    inFlightPromise = null;
  });

  return inFlightPromise;
}
