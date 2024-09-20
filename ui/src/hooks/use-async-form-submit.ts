import { useState } from "react";

export const useAsyncFormSubmit = () => {
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
      await fetch(url, {
        method,
        body: formData,
      });
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { onSubmit, isLoading, error };
};
