const { execSync } = require("child_process");
const fs = require("fs");

// Get branch pattern from command line arguments
const branchPattern = process.argv[2] || "feature/(AGOY-|SIM-)"; // Default pattern if none provided
const startDate = process.argv[3] || "2023-01-01"; // Default start date
const endDate = process.argv[4] || "2023-12-31"; // Default end date

const getChurnData = (branchPattern, startDate, endDate) => {
  const command = `git log --all --numstat --format="%H %as" --no-merges --since="${startDate}" --until="${endDate}" --branches="${branchPattern}"`;
  const output = execSync(command, { encoding: "utf-8" });
  const lines = output.split("\n");

  const churnData = {};
  let currentCommit = null;
  let currentDate = null;

  lines.forEach((line) => {
    if (line.match(/^[0-9a-f]{40}/)) {
      [currentCommit, currentDate] = line.split(" ");
    } else if (line.match(/^\d+\t\d+\t/)) {
      const [added, deleted, file] = line.split("\t");
      if (!churnData[currentDate]) {
        churnData[currentDate] = { added: 0, deleted: 0, files: new Set() };
      }
      churnData[currentDate].added += parseInt(added);
      churnData[currentDate].deleted += parseInt(deleted);
      churnData[currentDate].files.add(file);
    }
  });

  return Object.entries(churnData).map(([date, data]) => ({
    date,
    added: data.added,
    deleted: data.deleted,
    filesChanged: data.files.size,
    churn: data.added + data.deleted,
  }));
};

const createGraph = (churnData) => {
  // This is a placeholder for graph creation
  // You would typically use a library like Chart.js for browser-based graphs
  // or node-canvas for server-side graph generation
  console.log("Graph data:", churnData);
};

// Example usage
const churnData = getChurnData(branchPattern, startDate, endDate);
console.log(JSON.stringify(churnData, null, 2));
createGraph(churnData);
