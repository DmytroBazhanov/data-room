import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Entity, type EntityData } from '@/components/custom/Entity.tsx';
import { EntityControls } from '@/components/custom/EntityControls.tsx';

type EntityType = 'folder' | 'file';

interface EntityContainerProps {
  entities: EntityData[];
  entityType: EntityType;
  dataroomId: string;
}

export function EntityContainer({
  entities: initialEntities,
  entityType,
  dataroomId,
}: EntityContainerProps) {
  const [entities, setEntities] = useState<EntityData[]>(initialEntities);
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const selectedCount = Object.keys(selectedMap).length;

  const toggleSelect = useCallback((id: string) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  }, []);

  const getSelectedIds = useCallback((): string[] => {
    return Object.keys(selectedMap);
  }, [selectedMap]);

  const handleCreate = useCallback(() => {
    const name = prompt('Enter name:');
    if (!name) return;

    const exists = entities.some(
      (e) => e.id.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      alert('An entity with this name already exists.');
      return;
    }

    const newEntity: EntityData = {
      id: name,
      name,
      type: entityType,
      dataroomName: dataroomId,
    };
    setEntities((prev) => [...prev, newEntity]);
  }, [entityType, dataroomId, entities]);

  const handleRename = useCallback(() => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;

    const newName = prompt('Enter new name:');
    if (!newName) return;

    setEntities((prev) =>
      prev.map((e) =>
        selectedIds.includes(e.id) ? { ...e, name: newName } : e
      )
    );
  }, [getSelectedIds]);

  const handleDelete = useCallback(() => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;

    setEntities((prev) => prev.filter((e) => !selectedIds.includes(e.id)));
    setSelectedMap((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => delete next[id]);
      return next;
    });
  }, [getSelectedIds]);

  const handleOpen = useCallback(() => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;

    const selectedEntity = entities.find((e) => selectedIds.includes(e.id));
    if (!selectedEntity) return;

    if (selectedEntity.type === 'folder') {
      navigate(`${pathname}/${selectedEntity.id}`);
    } else {
      alert('file opened');
    }
  }, [getSelectedIds, entities, navigate, pathname]);

  const handleDoubleClick = useCallback(
    (entity: EntityData) => {
      if (entity.type === 'folder') {
        navigate(`${pathname}/${entity.id}`);
      } else {
        alert('file opened');
      }
    },
    [navigate, pathname]
  );

  const isFolderLayout = entityType === 'folder';

  return (
    <div>
      <EntityControls
        onCreate={handleCreate}
        onRename={selectedCount === 1 ? handleRename : undefined}
        onDelete={handleDelete}
        onOpen={selectedCount === 1 ? handleOpen : undefined}
      />

      {entities.length === 0 ? (
        <div
          className={
            isFolderLayout
              ? 'mt-2 w-full h-[50px] border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center'
              : 'mt-2 w-full h-[300px] border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center'
          }
        >
          Your {isFolderLayout ? 'folders' : 'files'} will be displayed here
        </div>
      ) : (
        <div
          className={
            isFolderLayout
              ? 'mt-2 flex grow-0 w-full gap-1 overflow-x-auto'
              : 'mt-2 flex flex-wrap gap-1'
          }
        >
          {entities.map((entity) => (
            <Entity
              key={entity.id}
              entity={entity}
              isSelected={!!selectedMap[entity.id]}
              onClick={() => toggleSelect(entity.id)}
              onDoubleClick={() => handleDoubleClick(entity)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
