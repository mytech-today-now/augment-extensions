'use strict';
const descriptions = {
  research: 'Collect referenced evidence from supplied local source documents into a research record.',
  write: 'Compose a local draft from supplied evidence without publishing it.',
  review: 'Inspect supplied local evidence and produce a review checklist and findings.'
};
async function execute(context) {
  const { task, sources, worker } = context;
  if (!Object.hasOwnProperty.call(descriptions, worker)) throw new Error('Worker unavailable');
  const notes = sources.map(s => ({ source: s.path, sha256: s.sha256, excerpt: s.content.slice(0, 4000) }));
  return { schemaVersion: 1, kind: worker, goal: task.goal,
    body: worker === 'write' ? notes.map(s => `${s.source}: ${s.excerpt}`).join('\n\n') : worker === 'review' ? 'Reviewed the supplied local documents for the stated goal. Findings require caller acceptance checks.' : 'Collected evidence from supplied local documents; no network research performed.',
    sources: notes };
}
module.exports = { descriptions, execute };
