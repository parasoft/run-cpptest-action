# Run C/C++test Action

This action enables you to run code analysis with Parasoft C/C++test and review analysis results directly on GitHub.

Parasoft C/C++test uses a comprehensive set of analysis techniques, including pattern-based static analysis, dataflow analysis, metrics, code coverage, unit testing, and more, to help you verify code quality and ensure compliance with industry standards.
 - Request [a free trial](https://www.parasoft.com/products/parasoft-c-ctest/try/) to receive access to Parasoft C/C++test's features and capabilities.
 - See the [user guide](https://docs.parasoft.com/display/CPPTEST20202) for information about Parasoft C/C++test's capabilities and usage.

Please visit the [official Parasoft website](http://www.parasoft.com) for more information about Parasoft C/C++test and other Parasoft products.

## Quick start

To analyze your code with Parasoft C/C++test and review analysis results on GitHub, you need to customize your GitHub workflow to include:
 - Integration with your C/C++ build, to understand scope of the analysis. 
 - The action to run C/C++test analyzer.
 - The action to upload the C/C++test analysis report in the SARIF format to GitHub.
 - The action to upload the C/C++test analysis reports as workflow artifacts.

### Prerequisites
This action requires Parasoft C/C++test with a valid Parasoft license.

We recommend that you run Parasoft C/C++test on a self-hosted rather than GitHub-hosted runner.

### Adding the C/C++test Action to a GitHub Workflow
Adding the action to run C/C++test analyzer to your workflow allows you to launch code analysis with Parasoft C/C++test.

Depending on the project type and the build system used (Make, CMake, etc.), you may need to adjust the workflow, to collect required input data for C/C++test - see also [user guide](https://docs.parasoft.com/display/CPPTEST20202/Running+Static+Analysis+1).

The following examples show simple workflows made up of one job "Analyze project with C/C++test" for Make and CMake based projects. The example assumes that C/C++test is run on a self-hosted runner and the path to `cpptestcli` executable is available on `$PATH`.

### Uploading Analysis Results to GitHub
By default, the `Run C/C++test` action generates analysis reports in SARIF, XML and HTML format.

When you upload the SARIF report to GitHub, the results will be presented as GitHub code scanning alerts. This allows you to review the results of code analysis with Parasoft C/C++test directly on GitHub as part of your project.
To upload the SARIF report to GitHub, modify your workflow to add the `upload-sarif` action.

You can also upload other reports (XML, HTML) to GitHub and link them with your workflow by using the `upload-artifact` action.

### Examples
#### Run C/C++test with CMake project

```yaml

# This is a basic workflow to help you get started with the Run C/C++test action for CMake-based project.
name: C/C++test with CMake

on:
  # Trigger the workflow on push or pull request events but only for the master branch.
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

  # Allow running this workflow manually from the Actions tab.
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel.
jobs:
  run-cpptest-make:
    name: Analyze project with C/C++test

    # Specifies the type of runner that the job will run on.
    runs-on: self-hosted

    # Steps represent a sequence of tasks that will be executed as part of the job.
    steps:

    # Check out your repository under $GITHUB_WORKSPACE, so that your job can access it.
    - name: Checkout code
      uses: actions/checkout@v2

    # Configure your CMake project - be sure the compile_commands.json file is created.
    - name: Configure project
      run: cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=1 -S . -B build

    # Build your CMake project (optional - not required for the code analysis).
    - name: Build project (optional)
      run: cmake --build build

    # Run code analysis with C/C++test.
    - name: Run C/C++test
      # Use dedicated 'run-cpptest-action' GitHub Action.
      uses: parasoft/run-cpptest-action@1.0.0
      # Optional parameters for 'run-cpptest-action'
      with:
        # For CMake-based projects, use compile_commands.json file as the input to analysis. 
        input: build/compile_commands.json

    # Upload analysis results in SARIF format, so they are available as GitHub code scanning alerts.
    - name: Upload results (SARIF)
      uses: github/codeql-action/upload-sarif@v1
      with:
        sarif_file: reports/report.sarif
    
    # Upload archive with all report files (.xml, .html, .sarif).
    - name: Archive reports
      uses: actions/upload-artifact@v2
      with:
        name: Static analysis reports
        path: reports/*.*

```

#### Run C/C++test with Make project

```yaml

# This is a basic workflow to help you get started with the Run C/C++test action for Make-based project.
name: C/C++test with Make

on:
  # Trigger the workflow on push or pull request events but only for the master branch.
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

  # Allow running this workflow manually from the Actions tab.
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel.
jobs:
  run-cpptest-make:
    name: Analyze project with C/C++test

    # Specifies the type of runner that the job will run on.
    runs-on: self-hosted

    # Steps represent a sequence of tasks that will be executed as part of the job.
    steps:

    # Check out your repository under $GITHUB_WORKSPACE, so that your job can access it.
    - name: Checkout code
      uses: actions/checkout@v2
    
    # Build your Make project - using 'cpptesttrace' to collect input data for the code analysis.
    # Be sure 'cpptesttrace' is available on $PATH.
    - name: Build project
      run: cpptesttrace make clean all

    # Run code analysis with C/C++test.
    - name: Run C/C++test
      # Use dedicated 'run-cpptest-action' GitHub Action.
      uses: parasoft/run-cpptest-action@1.0.0

    # Upload analysis results in SARIF format, so they are available as GitHub code scanning alerts.
    - name: Upload results (SARIF)
      uses: github/codeql-action/upload-sarif@v1
      with:
        sarif_file: reports/report.sarif
    
    # Upload archive with all report files (.xml, .html, .sarif).
    - name: Archive reports
      uses: actions/upload-artifact@v2
      with:
        name: Static analysis reports
        path: reports/*.*

```
## Configuring Analysis with C/C++test
You can configure analysis with Parasoft C/C++test in the following ways:
 - By customizing the `Run C/C++test` action directly in your GitHub workflow. See [Optional Parameters](#optional-parameters) for a complete list of available parameters.
 - By configuring options directly in Parasoft C/C++test tool. See [Parasoft C/C++test User Guide](https://docs.parasoft.com/display/CPPTEST20202/Configuration+1) for details. Hint: create `cpptestcli.properties` file with all the customization options and put the file into the code analysis working directory (usually, the root location of your repository) - C/C++test will automatically read all the options from that file.

### Examples
This section includes practical examples of how the `Run C/C++test` action can be customized directly in the YAML file of your workflow. 

#### Configuring the Path to the C/C++test Installation Directory
If `cpptestcli` executable is not on `$PATH`, you can configure the path to the installation directory of Parasoft C/C++test, by using the `installDir` parameter:

```yaml
- name: Run C/C++test
  uses: parasoft/run-cpptest-action@1.0.0
  with:
    installDir: '/opt/parasoft/cpptest'
```

#### Defining the Scope for Analysis
You configure the `input` parameter to provide path to a file defining scope of the analysis (list of source files and compile commands). This parameter depends on the project type and build system used - see also [user guide](https://docs.parasoft.com/display/CPPTEST20202/Running+Static+Analysis+1).
```yaml
- name: Run C/C++test
  uses: parasoft/run-cpptest-action@1.0.0
  with:
    input: 'build/compile_commands.json'
```

#### Configuring a C/C++test Test Configuration
Code analysis with C/C++test is performed by using a test configuration - a set of static analysis rules that enforce best coding practices or compliance guidelines. Parasoft C/C++test ships with a wide range of [built-in test configurations](https://docs.parasoft.com/display/CPPTEST20202/Built-in+Test+Configurations).
To specify a test configuration directly in your workflow, add the `testConfig` parameter to `Run C/C++test` action and specify the URL of the test configuration you want to use:
```yaml
- name: Run C/C++test
  uses: parasoft/run-cpptest-action@1.0.0
  with:
    testConfig: 'builtin://MISRA C 2012'
```

#### Configuring a C/C++test Compiler Configuration
In order to run analysis, C/C++test needs to be configured for specific compiler. You should select the configuration that matches your compiler and specify it with `compilerConfig` parameter. See [Supported Compilers](https://docs.parasoft.com/display/CPPTEST20202/Supported+Compilers) for information about supported compilers.
```yaml
- name: Run C/C++test
  uses: parasoft/run-cpptest-action@1.0.0
  with:
    compilerConfig: 'clang_10_0'
```

## Optional Parameters
The following inputs are available for this action:
| Input | Description |
| --- | --- |
| `installDir` | Installation folder of Parasoft C/C++test. If not specified, cpptestcli executable will be searched on `$PATH`.|
| `workingDir` | Working directory for running C/C++test. If not specified, `${{ github.workspace }}` will be used.|
| `compilerConfig` | Identifier of a compiler configuration. Ensure you specify the configuration that matches your compiler. If not specified, `gcc_9-64` configuration will be used. |
| `testConfig` | Test configuration to be used when running code analysis. Default value is `builtin://Recommended Rules`.|
| `reportDir` | Output folder for the analysis reports. If not specified, report files will be created in `reports` folder.|
| `reportFormat`| Format of the analysis reports. Default value is `xml,html,sarif`.|
| `input` | Input scope for analysis - usually `cpptestscan.bdf` or `compile_commands.json` (depending on a project type and build system). Default value is `cpptestscan.bdf`.|
| `commandLinePattern` | Command line pattern for running C/C++test. It should be modified for advanced scenarios only. Default value: `${cpptestcli} -compiler "${compilerConfig}" -config "${testConfig}" -property report.format=${reportFormat} -report "${reportDir}" -module . -input "${input}"`|