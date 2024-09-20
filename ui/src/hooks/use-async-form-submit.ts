import { useState } from "react";

export type AsyncFormSubmitProps = {
  onSuccess?: () => void;
};

export const useAsyncFormSubmit = (
  props?: AsyncFormSubmitProps | undefined,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

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
