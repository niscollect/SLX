import { callParse } from '../src/service/parse_caller.js';

(async () => {
  try {
    const json = await callParse('./test/index.js');
    console.log('parse result:', json);
  } catch (err) {
    console.error('Error during parse test:', err);
  }
})();
