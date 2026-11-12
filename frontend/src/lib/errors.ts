import { ref } from "vue";

export interface CapturedError {
  at: string;
  code: string;
  message: string;
}

/** Errors reported by CopilotKitProvider's onError, newest first. */
export const capturedErrors = ref<CapturedError[]>([]);

export function captureError(event: { error: Error; code: unknown }) {
  capturedErrors.value = [
    {
      at: new Date().toLocaleTimeString(),
      code: String(event.code),
      message: event.error?.message ?? String(event.error),
    },
    ...capturedErrors.value,
  ].slice(0, 20);
}

export function clearErrors() {
  capturedErrors.value = [];
}
