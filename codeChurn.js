const express = require("express");
const { execSync } = require("child_process");
const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 4000;

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));

// Get command line arguments
const repoUrl = process.argv[2]; // GitHub repository URL
const branchPattern = process.argv[3] || "feature/(AGOY-|SIM-)"; // Default pattern if none provided
const startDate = process.argv[4] || "2023-01-01"; // Default start date
const endDate = process.argv[5] || "2023-12-31"; // Default end date
const showGraph = process.argv.includes("-graph"); // Check for -graph flag

const analyzeRepo = async (repoUrl) => {
  const repoName = path.basename(repoUrl, ".git"); // Get the repository name
  const localPath = path.join(__dirname, repoName);

  // Check if the repository is already cloned
  const git = simpleGit();
  if (!fs.existsSync(localPath)) {
    // Clone the repository if it doesn't exist
    try {
      await git.clone(repoUrl, localPath);
    } catch (error) {
      console.error("Error cloning the repository:", error.message);
      return;
    }
  } else {
    console.log(`Repository already cloned at ${localPath}.`);
  }

  // Change directory to the cloned repository
  process.chdir(localPath);

  const getChurnData = (branchPattern, startDate, endDate) => {
    const command = `git log --all --numstat --format="%H %ai" --no-merges --since="${startDate}" --until="${endDate}" --branches="${branchPattern}"`;
    const output = execSync(command, { encoding: "utf-8" });
    const lines = output.split("\n");

    let totalAdded = 0;
    let totalDeleted = 0;
    let totalModified = 0; // To track modified lines
    let totalFilesChanged = new Set();
    const dailyData = {};

    lines.forEach((line) => {
      // Check for numstat lines
      if (line.match(/^\d+\t\d+\t/)) {
        const [added, deleted, file] = line.split("\t");
        const date = lines[lines.indexOf(line) - 1].split(" ")[1]; // Get the date from the previous line
        totalAdded += parseInt(added);
        totalDeleted += parseInt(deleted);
        totalFilesChanged.add(file);

        // Aggregate daily data
        if (!dailyData[date]) {
          dailyData[date] = {
            added: 0,
            deleted: 0,
            modified: 0,
            files: new Set(),
          };
        }
        dailyData[date].added += parseInt(added);
        dailyData[date].deleted += parseInt(deleted);
        dailyData[date].files.add(file);
      }
    });

    // Calculate modified lines using git diff
    const diffCommand = `git diff --stat --numstat --since="${startDate}" --until="${endDate}" --branches="${branchPattern}"`;
    const diffOutput = execSync(diffCommand, { encoding: "utf-8" });
    const diffLines = diffOutput.split("\n");

    diffLines.forEach((line) => {
      if (line.match(/^\d+\t\d+\t/)) {
        const [added, deleted, file] = line.split("\t");
        totalModified += parseInt(added) + parseInt(deleted); // Count modified lines
      }
    });

    const totalChurn = totalAdded + totalDeleted + totalModified;
    const totalLOC = execSync(`git rev-list --all --objects | wc -l`, {
      encoding: "utf-8",
    }).trim(); // Get total lines of code
    const churnRatePercentage = ((totalChurn / totalLOC) * 100).toFixed(2);
    const numberOfDays =
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const averageDailyChurn = (totalChurn / numberOfDays).toFixed(2);
    const commitCount = lines.filter((line) =>
      line.match(/^[0-9a-f]{40}/)
    ).length; // Count commits

    return {
      totalAdded,
      totalDeleted,
      totalModified,
      totalFilesChanged: totalFilesChanged.size,
      churn: totalChurn,
      churnRatePercentage,
      averageDailyChurn,
      commitCount,
      dailyData,
    };
  };

  // Example usage
  const churnData = getChurnData(branchPattern, startDate, endDate);
  return {
    ...churnData,
    branchPattern, // Include the branch pattern
    startDate, // Include the start date
    endDate, // Include the end date
    repoName, // Include the repository name
  }; // Return churn data for use in the API
};

// API endpoint to get churn data
app.get("/api/churn", async (req, res) => {
  const churnData = await analyzeRepo(repoUrl);
  res.json(churnData);
});

// Start the server if -graph flag is used
if (showGraph) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
} else {
  // Run the analysis and display results in the terminal
  analyzeRepo(repoUrl)
    .then((churnData) => {
      console.log(`Filter Used: ${churnData.branchPattern}`);
      console.log(
        `Period: from ${churnData.startDate} to ${churnData.endDate}`
      );
      console.log(`Total Lines Added: ${churnData.totalAdded}`);
      console.log(`Total Lines Deleted: ${churnData.totalDeleted}`);
      console.log(`Total Lines Modified: ${churnData.totalModified}`);
      console.log(`Total Files Changed: ${churnData.totalFilesChanged}`);
      console.log(`Total Churn: ${churnData.churn}`);
      console.log(`Churn Rate Percentage: ${churnData.churnRatePercentage}%`);
      console.log(`Average Daily Churn: ${churnData.averageDailyChurn}`);
      console.log(`Total Commits: ${churnData.commitCount}`);
    })
    .catch((err) => console.error(err));
}
