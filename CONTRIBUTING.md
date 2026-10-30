# Contributing to Cuportal-Revanced

Thanks for your interest in contributing! This guide explains how to report issues, propose changes, and get your work merged.


## Ways to Contribute

- **Report bugs:** open an issue describing the bug.
- **Suggest features:** open an issue describing proposed features and why.
- **Submit code:** fix a bug or implement a feature via pull request.


## Before You Start

For anything larger than a small fix, **please open an issue first** to discuss your idea. This avoids wasted effort if the change doesn't fit the project's direction.

Check existing issues and pull requests to make sure your idea hasn't already been raised.

## Reporting Bugs

A good bug report includes:

1. A clear, descriptive title
2. Steps to reproduce the problem
3. Expected behavior vs. actual behavior
4. Logs, screenshots, or a minimal code sample if possible

## Development Setup

1. **Fork** the repository and clone your fork:

   ```bash
   git clone https://github.com/THAT-RANDOM-DUD3/Cuportal-Revanced.git
   cd Cuportal-Revanced
   ```

2. **Add the upstream remote:**

   ```bash
   git remote add upstream https://github.com/THAT-RANDOM-DUD3/Cuportal-Revanced.git
   ```


## Making Changes

1. **Create a branch** from an up-to-date `main`:

   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feat/new-functionality
   ```

   Branch naming: `feat/...`, `fix/...`, `docs/...`, `chore/...`

2. **Make your changes.** Keep each pull request focused on a single concern.


3. **Update documentation** if your change affects usage or behavior.

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional scope): <short summary>
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

Examples:

```
feat(parser): add support for nested arrays
fix: handle empty input without crashing
docs: clarify installation steps
```

Keep the summary under 72 characters, in the imperative mood ("add", not "added").

## Submitting a Pull Request

1. Push your branch to your fork:

   ```bash
   git push origin feat/new-functionality
   ```

2. Open a pull request against `main`
3. Link the related issue (e.g., `Closes #123`).

### Pull Request Checklist

- [ ] The change is focused and described clearly
- [ ] The PR is linked to an issue (if applicable)

## Review Process

- A maintainer will review your PR, usually within 🤷‍♂️ days.
- You may be asked to make changes. Push new commits to the same branch to update the PR.
- All review conversations must be resolved before merging.
- Once approved and all checks pass, a maintainer will merge it. We typically rebase to keep history clean.

## Code Style

- Follow the existing style in the codebase
- Prefer clear, readable code over clever code
- Add comments to explain *why*, not *what*

## License

By contributing, you agree that your contributions will be licensed under the same license as the 
project. See [LICENSE](https://github.com/THAT-RANDOM-DUD3/Cuportal-Revanced/blob/main/LICENSE) for details.

## Questions?

Open a discussion or an issue, or contact the maintainers( [praise](https://t.me/praise_adesina),[alpheaus](https://t.me/o_o_alphe) and [ambrose](https://t.me/aondoma) ). We're happy to help.
