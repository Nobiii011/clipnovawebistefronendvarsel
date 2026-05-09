// src/hooks/useVideos.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { getVideos, createVideo, updateVideo, deleteVideo } from "../services/video.service";

export function useVideos(params) {
  return useQuery({
    queryKey: queryKeys.videos(),
    queryFn: () => getVideos(params),
    staleTime: 1000 * 60,
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createVideo,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.videos() }),
  });
}

export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateVideo(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.videos() }),
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteVideo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.videos() }),
  });
}
