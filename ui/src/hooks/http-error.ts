export class HTTPError extends Error {
  constructor(private readonly response: Response) {
    super(`HTTP Error: ${response.status} - ${response.statusText}`);
  }

  get status() {
    return this.response.status;
  }
}
