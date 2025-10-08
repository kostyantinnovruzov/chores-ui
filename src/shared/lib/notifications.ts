export function notifySuccess(message: string) {
  // TODO: integrate with design system toast component
  console.info(`[SUCCESS]: ${message}`);
}

export function notifyError(message: string) {
  // TODO: integrate with design system toast component
  console.error(`[ERROR]: ${message}`);
}
