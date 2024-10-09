import { useState } from "react";

export type AsyncFormSubmitProps = {
  onSuccess?: () => void;
};

type AsyncFormSubmitReturnType = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
};

export const useAsyncFormSubmit = (
  props?: AsyncFormSubmitProps | undefined,
): AsyncFormSubmitReturnType => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const url = form.action;
    const method = form.method;
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.status === 403) {
        throw new Error(`${response.status} - ${await response.text()}`, {
          cause: "cooldown",
        });
      }

      if (!response.ok) {
        throw new Error(`${response.status} - ${await response.text()}`);
      }
      form.reset();
      props?.onSuccess?.();
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { onSubmit, isLoading, error };
};
