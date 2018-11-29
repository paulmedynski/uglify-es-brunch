// ***************************************************************************
// A wrapper around a Promise that can be waited on over and over again.

export type ResolveFunc = (result: string) => void;
export type RejectFunc = (error: Error) => void;

export default class Waiter
{
  // Construct to set inert resolve() and reject() members.
  constructor()
  {
    this.resolve = () => {};
    this.reject = () => {};
  }

  // Create an return a Promise, whose reject() and resolve() methods are
  // wired up to our members.
  public wait(): Promise<string>
  {
    return new Promise<string>(
      (resolve: ResolveFunc, reject: RejectFunc) =>
      {
        this.resolve = resolve;
        this.reject = reject;
      });
  }

  // Resolve our promise with the given result.
  public done(result: string): void
  {
    this.resolve(result);

    // This should be removed in the minfied code.
    if (DEBUG)
    {
      console.log('Dead code!');
    }
  }

  // Reject our promise with the given error.
  public error(result: Error): void
  {
    this.reject(result);
  }

  // Private members.
  private resolve: ResolveFunc;
  private reject: RejectFunc;
}

// ***************************************************************************
