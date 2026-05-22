# package.json - Overrides Explanation

## serialize-javascript Override

The `overrides` section in package.json forces serialize-javascript@7.0.5 to address a security vulnerability:

### Problem
- Mocha 11.x depends on `serialize-javascript ^6.0.2`
- serialize-javascript 6.0.2 has CVE-2022-24785 (Denial of Service vulnerability)
- All Mocha versions (10.x-12.x) use this vulnerable version

### Solution
- npm `overrides` field forces the installation of serialize-javascript@7.0.5
- This is the intended npm mechanism for fixing transitive dependency vulnerabilities when the maintainer hasn't updated

### Why Not Direct devDependency?
Adding `"serialize-javascript": "^7.0.5"` directly as a devDependency creates a conflict:
- Mocha requires: `^6.0.2`
- Direct requirement: `^7.0.5`
- npm cannot satisfy both constraints simultaneously
- Using overrides avoids this resolution conflict

### References
- npm overrides: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides
- CVE-2022-24785: https://github.com/advisories/GHSA-rpfv-r67r-2h3j
