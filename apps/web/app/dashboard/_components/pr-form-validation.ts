import type { FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import type { FormValues } from "./pr-form.schema";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export function getMediaValidationError(file: File) {
  if (!allowedMimeTypes.includes(file.type)) {
    return "Upload an image or video file";
  }

  if (file.size > 25 * 1024 * 1024) {
    return "Media file must be 25MB or smaller";
  }

  return null;
}

export function onInvalid(formErrors: FieldErrors<FormValues>) {
  const message =
    formErrors.url?.message ??
    formErrors.context?.message ??
    "Check the form and try again";

  toast.error(message, {
    duration: 7000,
  });
}
