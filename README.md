# Churn Analysis Tool

## Overview

The Churn Analysis Tool is a web-based application designed to analyze the churn of a Git repository. It provides insights into the amount of code added, modified, and deleted over a specified period.

## Features

- **Churn Analysis**: Analyze the total lines of code added, deleted, and modified in a Git repository.
- **Graphical Representation**: Visualize churn data in a bar chart for easy interpretation.
- **Summary Statistics**: Get detailed statistics, including churn rate percentage, average daily churn, and total commits.

## Outputs

The tool provides two main outputs:

1. **Terminal Output**: When run without the `-graph` flag, the tool outputs the churn analysis results directly in the terminal. This includes:
   - Total Lines Added
   - Total Lines Deleted
   - Total Lines Modified
   - Total Files Changed
   - Total Churn
   - Churn Rate Percentage
   - Average Daily Churn
   - Total Commits

2. **Graphical Output**: When run with the `-graph` flag, the tool serves a web page displaying a bar chart of the churn data along with a summary of the statistics. The web interface is designed with a modern dark mode for better visibility.

## Flags

The tool supports the following command-line flags:

- `-graph`: Use this flag to display the churn analysis results in a graphical format in your web browser.

## Usage

To use the Churn Analysis Tool, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/lecagabriel/churn-analysis.git
   cd churn-analysis
   ```

2. **Install Dependencies**:
   Make sure you have Node.js installed. Then, install the required packages:
   ```bash
   npm install
   ```

3. **Run the Tool**:
   You can run the tool with the following command:

   - **For Terminal Output**:
     ```bash
     node path/to/codeChurn.js "https://github.com/user/repo.git" "your-branch-pattern" "start-date" "end-date"
     ```

   - **For Graphical Output (-graph flag)**:
     ```bash
     node path/to/codeChurn.js "https://github.com/user/repo.git" "your-branch-pattern" "start-date" "end-date" -graph
     ```

   Replace the placeholders with the appropriate values:
   - `https://github.com/user/repo.git`: The URL of the GitHub repository you want to analyze.
   - `your-branch-pattern`: The branch pattern to filter the analysis (optional).
   - `start-date`: The start date for the analysis (format: YYYY-MM-DD).
   - `end-date`: The end date for the analysis (format: YYYY-MM-DD).

## Example

To analyze a repository with a specific branch pattern and date range, you can run:
 ```bash
node path/to/codeChurn.js "https://github.com/example/repo.git" "feature/" "2023-01-01" "2023-12-31" -graph
````
This command will display the churn analysis results in a graphical format in your localhost:4000.

## Note

In the current version, the git repository will be locally cloned.

