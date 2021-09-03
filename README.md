# Run Parasoft C/C++test

[![Build](https://github.com/parasoft/run-cpptest-action/actions/workflows/build.yml/badge.svg)](https://github.com/parasoft/run-cpptest-action/actions/workflows/build.yml)
[![CodeQL](https://github.com/parasoft/run-cpptest-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/parasoft/run-cpptest-action/actions/workflows/codeql-analysis.yml)
[![Test](https://github.com/parasoft/run-cpptest-action/actions/workflows/test.yml/badge.svg)](https://github.com/parasoft/run-cpptest-action/actions/workflows/test.yml)

This action enables you to run code analysis with Parasoft C/C++test Standard and review analysis results directly on GitHub. To run code analysis with C/C++test Professional, this action must be customized with additional options; see [Customizing the Action to Run C/C++test Professional](#customizing-the-action-to-run-cctest-professional).

Parasoft C/C++test uses a comprehensive set of analysis techniques, including pattern-based static analysis, dataflow analysis, metrics, code coverage, unit testing, and more, to help you verify code quality and ensure compliance with industry standards, such as MISRA, AUTOSAR, and CERT.
 - Request [a free trial](https://www.parasoft.com/products/parasoft-c-ctest/try/) to receive access to Parasoft C/C++test's features and capabilities.
 - See the [user guide](https://docs.parasoft.com/display/CPPTEST20202) for information about Parasoft C/C++test's capabilities and usage.

Please visit the [official Parasoft website](http://www.parasoft.com) for more information about Parasoft C/C++test and other Parasoft products.

- [Quick start](#quick-start)
- [Example Workflows](#example-workflows)
- [Configuring Analysis with C/C++test](#configuring-analysis-with-cctest)
- [Action Parameters](#action-parameters)
- [Customizing the Action to Run C/C++test Professional](#customizing-the-action-to-run-cctest-professional)


## Quick start

To analyze your code with Parasoft C/C++test and review analysis results on GitHub, you need to customize your GitHub workflow to include:
 - Integration with your C/C++ build to determine the scope of analysis. 
 - The action to run C/C++test.
 - The action to upload the C/C++test analysis report in the SARIF format to GitHub.
 - The action to upload the C/C++test analysis reports in other formats (XML, HTML, etc.) to GitHub as workflow artifacts.

### Prerequisites
This action requires Parasoft C/C++test with a valid Parasoft license.

We recommend that you run Parasoft C/C++test on a self-hosted rather than GitHub-hosted runner.

### Adding the Run C/C++test Action to a GitHub Workflow
Add the `Run C/C++test` action to your workflow to launch code analysis with Parasoft C/C++test.

Depending on the project type and the build system you are using (Make, CMake, etc.), you may need to adjust the workflow to collect the required input data for C/C++test. See the [C/C++test User Guide](https://docs.parasoft.com/display/CPPTEST20202/Running+Static+Analysis+1) for details.

```yaml
# Runs code analysis with C/C++test.
- name: Run C/C++test
  uses: parasoft/run-cpptest-action@1.0.1
  with:
    input: build/compile_commands.json
    testConfig: 'builtin://MISRA C 2012'
    compilerConfig: 'clang_10_0'
```

### Uploading Analysis Results to GitHub
By default, the `Run C/C++test` action generates analysis reports in the SARIF, XML, and HTML format (if you are using a C/C++test version earlier than 2021.1, see [Generating SARIF Reports with C/C++test 2020.2 or Earlier](#generating-sarif-reports-with-cctest-20202-or-earlier)).

When you upload the SARIF report to GitHub, the results will be presented as GitHub code scanning alerts. This allows you to review the results of code analysis with Parasoft C/C++test directly on GitHub as part of your project.
To upload the SARIF report to GitHub, modify your workflow by adding the `upload-sarif` action.

```yaml
# Uploads analysis results in the SARIF format, so that they are displayed as GitHub code scanning alerts.
- name: Upload results (SARIF)
  if: always()
  uses: github/codeql-action/upload-sarif@v1
  with:
    sarif_file: reports/report.sarif
```

To upload reports in other formats, modify your workflow by adding  the `upload-artifact` action.

```yaml
# Uploads an archive that includes all report files (.xml, .html, .sarif).
- name: Archive reports
  if: always()
  uses: actions/upload-artifact@v2
  with:
    name: CpptestReports
    path: reports/*.*
```

## Example Workflows
The following examples show simple workflows made up of one job "Analyze project with C/C++test" for Make and CMake-based projects. The examples assume that C/C++test is run on a self-hosted runner and the path to the `cpptestcli` executable is available on `$PATH`.

#### Run C/C++test with CMake project

```yaml

# This is a basic workflow to help you get started with the Run C/C++test action for a CMake-based project.
name: C/C++test with CMake

on:
  # Triggers the workflow on push or pull request events but only for the master (main) branch.
  push:
    branches: [ master, main ]
  pull_request:
    branches: [ master, main ]

  # Allows you to run this workflow manually from the Actions tab.
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel.
jobs:
  run-cpptest-make:
    name: Analyze project with C/C++test

    # Specifies the type of runner that the job will run on.
    runs-on: self-hosted

    # Steps represent a sequence of tasks that will be executed as part of the job.
    steps:

    # Checks out your repository under $GITHUB_WORKSPACE, so that your job can access it.
    - name: Checkout code
      uses: actions/checkout@v2

    # Configures your CMake project. Be sure the compile_commands.json file is created.
    - name: Configure project
      run: cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=1 -S . -B build

    # Builds your CMake project. (This step is optional, as it is not required for code analysis).
    - name: Build project (optional)
      run: cmake --build build

    # Runs code analysis with C/C++test.
    - name: Run C/C++test
      # Use the 'run-cpptest-action' GitHub action.
      uses: parasoft/run-cpptest-action@1.0.1
      # Optional parameters for 'run-cpptest-action'.
      with:
        # For CMake-based projects, use a compile_commands.json file as the input for analysis. 
        input: build/compile_commands.json
        # Uncomment if you are using C/C++test 2020.2 to generate a SARIF report:
        # reportFormat: xml,html,custom
        # additionalParams: '-property report.custom.extension=sarif -property report.custom.xsl.file=${PARASOFT_SARIF_XSL}'

    # Uploads analysis results in the SARIF format, so that they are displayed as GitHub code scanning alerts.
    - name: Upload results (SARIF)
      if: always()
      uses: github/codeql-action/upload-sarif@v1
      with:
        sarif_file: reports/report.sarif
    
    # Uploads an archive that includes all report files (.xml, .html, .sarif).
    - name: Archive reports
      if: always()
      uses: actions/upload-artifact@v2
      with:
        name: CpptestReports
        path: reports/*.*

```

#### Run C/C++test with Make project

```yaml

# This is a basic workflow to help you get started with the Run C/C++test action for Make-based project.
name: C/C++test with Make

on:
  # Triggers the workflow on push or pull request events but only for the master (main) branch.
  push:
    branches: [ master, main ]
  pull_request:
    branches: [ master, main ]

  # Allows you to run this workflow manually from the Actions tab.
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel.
jobs:
  run-cpptest-make:
    name: Analyze project with C/C++test

    # Specifies the type of runner that the job will run on.
    runs-on: self-hosted

    # Steps represent a sequence of tasks that will be executed as part of the job.
    steps:

    # Checks out your repository under $GITHUB_WORKSPACE, so that your job can access it.
    - name: Checkout code
      uses: actions/checkout@v2
    
    # Builds your Make project using 'cpptesttrace' to collect input data for code analysis.
    # Be sure 'cpptesttrace' is available on $PATH.
    - name: Build project
      run: cpptesttrace make clean all

    # Runs code analysis with C/C++test.
    - name: Run C/C++test
      # Use the 'run-cpptest-action' GitHub action.
      uses: parasoft/run-cpptest-action@1.0.1
      # Uncomment if you are using C/C++test 2020.2 to generate a SARIF report:
      # with:
      #   reportFormat: xml,html,custom
      #   additionalParams: '-property report.custom.extension=sarif -property report.custom.xsl.file=${PARASOFT_SARIF_XSL}'

    # Uploads analysis results in the SARIF format, so that they are displayed as GitHub code scanning alerts.
    - name: Upload results (SARIF)
      if: always()
      uses: github/codeql-action/upload-sarif@v1
      with:
        sarif_file: reports/report.sarif
    
    # Uploads an archive that includes all report files (.xml, .html, .sarif).
    - name: Archive reports
      if: always()
      uses: actions/upload-artifact@v2
      with:
        name: CpptestReports
        path: reports/*.*

```
## Configuring Analysis with C/C++test
You can configure analysis with Parasoft C/C++test in the following ways:
 - By customizing the `Run C/C++test` action directly in your GitHub workflow. See [Action Parameters](#action-parameters) for a complete list of available parameters.
 - By configuring options in Parasoft C/C++test tool. We recommend creating a `cpptestcli.properties` file that includes all the configuration options and adding the file to C/C++test's working directory  - typically, the root directory of your repository. This allows C/C++test to automatically read all the configuration options from that file. See [Parasoft C/C++test User Guide](https://docs.parasoft.com/display/CPPTEST20202/Configuration+1) for details.

### Examples
This section includes practical examples of how the `Run C/C++test` action can be customized directly in the YAML file of your workflow. 

#### Configuring the Path to the C/C++test Installation Directory
If `cpptestcli` executable is not on `$PATH`, you can configure the path to the installation directory of Parasoft C/C++test, by configuring the `installDir` parameter:

```yaml
- name: Run C/C++test
  uses: parasoft/run-cpptest-action@1.0.1
  with:
    installDir: '/opt/parasoft/cpptest'
```

#### Defining the Scope of Analysis
You can configure the `input` parameter to provide the path to a file that defines the scope of analysis (includes a list of source files and compile commands). This parameter depends on the project type and the build system you are using. See the  [C/C++test User Guide](https://docs.parasoft.com/display/CPPTEST20202/Running+Static+Analysis+1) for details.
```yaml
- name: Run C/C++test
  uses: parasoft/run-cpptest-action@1.0.1
  with:
    input: 'build/compile_commands.json'
```

#### Configuring a C/C++test Test Configuration
Code analysis with C/C++test is performed by using a test configuration - a set of static analysis rules that enforce best coding practices or compliance guidelines. Parasoft C/C++test ships with a wide range of [built-in test configurations](https://docs.parasoft.com/display/CPPTEST20202/Built-in+Test+Configurations).
To specify a test configuration directly in your workflow, add the `testConfig` parameter to the `Run C/C++test` action and specify the URL of the test configuration you want to use:
```yaml
- name: Run C/C++test
  uses: parasoft/run-cpptest-action@1.0.1
  with:
    testConfig: 'builtin://MISRA C 2012'
```

#### Configuring a C/C++test Compiler Configuration
In order to run analysis, C/C++test needs to be configured for a specific compiler. You need to specify the configuration that matches your compiler with the `compilerConfig` parameter. See [Supported Compilers](https://docs.parasoft.com/display/CPPTEST20202/Supported+Compilers) for information about supported compilers.
```yaml
- name: Run C/C++test
  uses: parasoft/run-cpptest-action@1.0.1
  with:
    compilerConfig: 'clang_10_0'
```

#### Generating SARIF Reports with C/C++test 2020.2 or Earlier
Generating reports in the SARIF format is available in C/C++test since version 2021.1. If you are using an earlier C/C++test version, you need to customize the `Run C/C++test` action to enable generating SARIF reports:
```yaml
- name: Run C/C++test
  uses: parasoft/run-cpptest-action@1.0.1
  with:
    reportFormat: xml,html,custom
    additionalParams: '-property report.custom.extension=sarif -property report.custom.xsl.file=${PARASOFT_SARIF_XSL}'
```

## Action Parameters
The following inputs are available for this action:
| Input | Description |
| --- | --- |
| `installDir` | Installation folder of Parasoft C/C++test. If not specified, the `cpptestcli` executable must be added to `$PATH`.|
| `workingDir` | Working directory for running C/C++test. If not specified, `${{ github.workspace }}` will be used.|
| `compilerConfig` | Identifier of a compiler configuration. Ensure you specify the configuration that matches your compiler. If not specified, the `gcc_9-64` configuration will be used.|
| `testConfig` | Test configuration to be used for code analysis. The default is `builtin://Recommended Rules`.|
| `reportDir` | Output folder for reports from code analysis. If not specified, report files will be created in the `reports` folder.|
| `reportFormat`| Format of reports from code analysis. The default is `xml,html,sarif`.|
| `input` | Input scope for analysis  (typically, `cpptestscan.bdf` or `compile_commands.json`, depending on the project type and the build system). The default is `cpptestscan.bdf`.|
| `additionalParams` | Additional parameters for the `cpptestcli` executable.|
| `commandLinePattern` | Command line pattern for running C/C++test. It should only be modified in advanced scenarios. The default is: `${cpptestcli} -compiler "${compilerConfig}" -config "${testConfig}" -property report.format=${reportFormat} -report "${reportDir}" -module . -input "${input}" ${additionalParams}`|

## Customizing the Action to Run C/C++test Professional
This section describes how to customize the `Run C/C++test` action to run code analysis with Parasoft C/C++test Professional.

### Updating the Command Line for C/C++test Professional
Use the `commandLinePattern` parameter to modify the command line for `cpptestcli` executable. The command line pattern depends on your project and the setup of the workspace. Example:
```yaml
- name: Run C/C++test
  uses: parasoft/run-cpptest-action@1.0.1
  with:
    # C/C++test workspace will be created in '../workspace'.
    # C/C++test will create a new project based on the provided .bdf file.
    commandLinePattern: '${cpptestcli} -data ../workspace -config "${testConfig}" -report "${reportDir}" -bdf "${input}" ${additionalParams}'
```
Note: The `compilerConfig` and `reportFormat` action parameters are not directly applicable to the C/C++test Professional command line.

### Using Additional Configuration Options
Create a `config.properties` file with additional configuration options for C/C++test Professional, such as reporting options, compiler configuration etc. Then pass the configuration file to `cpptestcli` with the `-localsettings config.properties` option:
```yaml
- name: Run C/C++test
  uses: parasoft/run-cpptest-action@1.0.1
  with:
    # C/C++test will use options from 'config.properties'.
    additionalParams: '-localsettings config.properties'
    commandLinePattern: '${cpptestcli} -data ../workspace -config "${testConfig}" -report "${reportDir}" -bdf "${input}" ${additionalParams}'
```
### Generating SARIF Reports with C/C++test Professional
To enable generating SARIF reports, add the following options to the `config.properties` file.

In C/C++test Professional 2021.1 or newer:
```
report.format=sarif
```

In C/C++test Professional 2020.2 or earlier:
```
report.format=custom
report.custom.extension=sarif
report.custom.xsl.file=${PARASOFT_SARIF_PRO_XSL}
report.location_details=true
```
