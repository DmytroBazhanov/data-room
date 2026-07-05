import { useQuery } from '@tanstack/react-query';
import {
  fetchDatarooms,
  fetchDataroomContents,
} from '@/network/api/dataroom-api.ts';

const DATAROOMS_KEY = 'datarooms';
const DATAROOM_CONTENTS_KEY = 'dataroom-contents';

/** Fetch all datarooms for a user. */
export function useDatarooms(userId: string | undefined) {
  return useQuery({
    queryKey: [DATAROOMS_KEY, userId],
    queryFn: () => fetchDatarooms(userId!),
    enabled: !!userId,
  });
}

/** Fetch contents at a given path within a dataroom. */
export function useDataroomContents(
  userId: string | undefined,
  dataroomId: string | undefined,
  folderPath?: string
) {
  return useQuery({
    queryKey: [DATAROOM_CONTENTS_KEY, userId, dataroomId, folderPath],
    queryFn: () => fetchDataroomContents(userId!, dataroomId!, folderPath),
    enabled: !!userId && !!dataroomId,
  });
}
