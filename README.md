# Stress Test Project

A K6-based load testing project for stress testing web applications.

## Prerequisites

- Node.js (version 14 or higher)
- K6 load testing tool

## Installation

### Option 1: Install K6 via Package Manager (Recommended)

**Windows (using Chocolatey):**
```bash
choco install k6
```

**Windows (using Winget):**
```bash
winget install k6
```

**macOS (using Homebrew):**
```bash
brew install k6
```

**Linux (Ubuntu/Debian):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Option 2: Download Binary

Visit [K6 releases page](https://github.com/grafana/k6/releases) and download the appropriate binary for your system.

## Project Setup

1. Clone or download this project
2. Navigate to the project directory
3. Install dependencies (optional, for development):
   ```bash
   npm install
   ```

## Usage

### Basic Test Run
```bash
k6 run test.js
```

### Using NPM Scripts

- **Smoke Test** (1 user, 30 seconds):
  ```bash
  npm run test:smoke
  ```

- **Load Test** (100 users, 5 minutes):
  ```bash
  npm run test:load
  ```

- **Stress Test** (500 users, 10 minutes):
  ```bash
  npm run test:stress
  ```

- **Spike Test** (1000 users, 2 minutes):
  ```bash
  npm run test:spike
  ```

- **Custom Test** (using the configured stages):
  ```bash
  npm test
  ```

## Test Configuration

The current test configuration in `test.js` includes:

- **Ramp-up**: 30s to reach 100 users
- **Load increase**: 1m to reach 500 users  
- **Peak load**: 30s at 1000 users
- **Ramp-down**: 1m to 0 users

Target URL: `http://103.89.50.67`

## Customization

To modify the test:

1. **Change target URL**: Edit the `http.get()` call in the `default` function
2. **Adjust load pattern**: Modify the `stages` array in the `options` object
3. **Add more requests**: Include additional HTTP calls in the `default` function
4. **Add checks**: Import `check` from k6 and add response validations

## Example Output

K6 will provide detailed metrics including:
- HTTP request duration
- Request rate
- Error rate
- Virtual users count
- Data transfer statistics

## Troubleshooting

- Ensure K6 is properly installed and available in your PATH
- Check that the target URL is accessible
- Verify your system can handle the specified load (adjust VU count if needed)
- For Windows users, run PowerShell as Administrator if you encounter permission issues