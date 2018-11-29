// ***************************************************************************
// The main file of our test app.

// Import some types from our sibling files to see them minified together into the packaged file.
import Waiter, {RejectFunc, ResolveFunc} from './Waiter';

// Create a Jasmine test suite to show bare functions being minified.
describe('test', () =>
{
  it('wait', async () =>
  {
    const waiter = new Waiter();
    const wait = waiter.wait();
    setTimeout(() => { waiter.done('Yaay!'); }, 2000);
    const result = await wait;
    expect(result).toEqual('Yaay!');
    return Promise.resolve();
  });
});

// ***************************************************************************
