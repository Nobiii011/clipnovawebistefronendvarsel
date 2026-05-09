// src/hooks/useLinks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createLink, getVideoLinks, toggleLink } from "../services/link.service";

const K = {
  videoLinks: (videoId) => ["links", "video", videoId],
};

export function useVideoLinks(videoId) {
  return useQuery({
    queryKey: K.videoLinks(videoId),
    queryFn: () => getVideoLinks(videoId),
    enabled: !!videoId,
    staleTime: 60000,
  });
}

export function useCreateLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId) => createLink(videoId),
    onSuccess: (_, videoId) => qc.invalidateQueries({ queryKey: K.videoLinks(videoId) }),
  });
}

export function useToggleLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ linkId }) => toggleLink(linkId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["links"] }),
  });
}
