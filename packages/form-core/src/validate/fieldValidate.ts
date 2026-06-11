export const createRequiredFieldValidate = (message: string) => (value: any) => (value ? undefined : message);
