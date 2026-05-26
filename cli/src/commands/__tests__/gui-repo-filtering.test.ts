import { filterLinkedModulesToRepoModules, filterCollectionsToRepoModules } from '../gui';

describe('GUI repository filtering', () => {
  const repoModules = [
    {
      fullName: 'coding-standards/html',
      metadata: { modules: undefined }
    },
    {
      fullName: 'workflows/openspec',
      metadata: { modules: undefined }
    }
  ] as any[];

  it('keeps only linked modules that exist in this repository', () => {
    const linkedModules = [
      'coding-standards/html',
      'domain-rules/missing-module',
      'workflows/openspec'
    ];

    expect(filterLinkedModulesToRepoModules(linkedModules, repoModules as any)).toEqual([
      'coding-standards/html',
      'workflows/openspec'
    ]);
  });

  it('keeps only collections whose modules all exist in this repository', () => {
    const collections = [
      {
        fullName: 'collections/valid',
        metadata: {
          modules: [
            { id: 'coding-standards/html', version: '1.0.0', required: true },
            { id: 'workflows/openspec', version: '1.0.0', required: true }
          ]
        }
      },
      {
        fullName: 'collections/invalid',
        metadata: {
          modules: [
            { id: 'coding-standards/html', version: '1.0.0', required: true },
            { id: 'domain-rules/missing-module', version: '1.0.0', required: true }
          ]
        }
      }
    ];

    expect(filterCollectionsToRepoModules(collections as any, repoModules as any)).toEqual([
      collections[0]
    ]);
  });
});