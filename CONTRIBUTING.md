# Contributing to the Triodian installer and suite test

Thank you for helping. This repo is open source under the [Apache License, Version 2.0](LICENSE).

- For anything larger than a small fix, open an issue first so we can agree the approach.
- To report a security problem, do not open an issue: see [SECURITY.md](SECURITY.md).
- Please follow the [code of conduct](CODE_OF_CONDUCT.md).

## Making a change

1. Fork the repository and create a branch from `main`.
2. Check out the four app repos beside this one and run `npm ci` in each app's `tests/e2e`.
3. Run the checks:
   ```
   node test-install.mjs
   node suite/run.mjs
   ```
4. Open a pull request against `main`, saying what changed and why.

Never commit client names, domains, account ids, tokens or other secrets, in code or examples. The installer takes
them as answers when it runs.

By contributing you agree that your contribution is licensed under the Apache License, Version 2.0, as set out in its
section 5.
