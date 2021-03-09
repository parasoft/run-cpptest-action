# Run C/C++test Action

This action enables you to run code analysis with Parasoft C/C++test.

Please visit the [official Parasoft website](http://www.parasoft.com) for more information about Parasoft C/C++test and other Parasoft products.

## Quick start

To analyze your code with Parasoft C/C++test and review analysis results on GitHub, you need to customize your GitHub workflow to include:
 - The action to run C/C++test analyzer.
 - The action to upload the C/C++test analysis report in the SARIF format to GitHub.
 - The action to upload the C/C++test analysis reports as workflow artifacts.

### Prerequisites
This action requires Parasoft C/C++test with a valid Parasoft license.

We recommend that you run Parasoft C/C++test on a self-hosted rather than GitHub-hosted runner.
