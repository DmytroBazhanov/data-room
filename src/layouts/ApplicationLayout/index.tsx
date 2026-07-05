import { ApplicationSidebar } from '@/components/custom/Sidebar.tsx';
import { ApplicationSearch } from '@/components/custom/Search.tsx';
import { FolderCrumbs } from '@/components/custom/FolderCrumbs.tsx';
import { EntityContainer } from '@/components/custom/EntityContainer.tsx';
import type { EntityData } from '@/components/custom/Entity.tsx';

const mockFolders: EntityData[] = [
  {
    id: 'favorites',
    name: 'Favorites',
    type: 'folder',
    dataroomName: 'dataroom-alpha',
  },
  {
    id: 'images',
    name: 'Images',
    type: 'folder',
    dataroomName: 'dataroom-beta',
  },
];

const mockFiles: EntityData[] = [
  {
    id: 'doc1',
    name: 'Document',
    type: 'file',
    dataroomName: 'dataroom-gamma',
  },
  {
    id: 'sheet1',
    name: 'Spreadsheet',
    type: 'file',
    dataroomName: 'dataroom-delta',
  },
];

export function ApplicationLayout() {
  return (
    <div className="flex h-screen flex-row overflow-hidden">
      <ApplicationSidebar />

      <div className="flex flex-col h-full min-w-0 grow-1 w-full px-2">
        <ApplicationSearch />
        <div className="pt-2">
          <FolderCrumbs />
        </div>
        <main className="mx-auto max-h-[calc(100vh-72px)] w-full flex-1 overflow-y-auto py-4">
          <EntityContainer
            entities={mockFolders}
            entityType="folder"
            dataroomId="dataroom-alpha"
          />
          <EntityContainer
            entities={mockFiles}
            entityType="file"
            dataroomId="dataroom-alpha"
          />
        </main>
      </div>
    </div>
  );
}
