const fs = require('fs');
const path = require('path');

// Read the JSONL file
const issuesPath = path.join(__dirname, '.beads', 'issues.jsonl');
const lines = fs.readFileSync(issuesPath, 'utf-8').split('\n').filter(line => line.trim());

// Parse all issues
const issues = lines.map(line => JSON.parse(line));

// Get open issues
const openIssues = issues.filter(i => i.status === 'open');

// Find issues with no blockers or all blockers are closed
const readyIssues = openIssues.filter(issue => {
  if (!issue.dependencies || issue.dependencies.length === 0) {
    return true;
  }
  
  // Check if all blocking dependencies are closed
  const blockingDeps = issue.dependencies.filter(dep => dep.type === 'blocks');
  if (blockingDeps.length === 0) {
    return true;
  }
  
  return blockingDeps.every(dep => {
    const blocker = issues.find(i => i.id === dep.depends_on_id);
    return blocker && blocker.status === 'closed';
  });
});

// Sort by priority (lower number = higher priority)
readyIssues.sort((a, b) => (a.priority || 999) - (b.priority || 999));

// Display first 10 ready tasks
console.log('Ready to execute tasks (no blocking dependencies):');
console.log('='.repeat(80));
readyIssues.slice(0, 10).forEach((issue, idx) => {
  console.log(`${idx + 1}. [${issue.id}] ${issue.title}`);
  console.log(`   Priority: ${issue.priority || 'N/A'}, Type: ${issue.issue_type || 'task'}`);
  if (issue.description) {
    console.log(`   Description: ${issue.description.substring(0, 100)}...`);
  }
  console.log('');
});

