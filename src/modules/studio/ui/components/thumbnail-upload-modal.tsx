import { ResponsiveDialog } from "@/components/responsive-dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";

interface ThumbnailUploadModalProps {
  videoId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ThumbnailUploadModal = ({ videoId, isOpen, onOpenChange }: ThumbnailUploadModalProps) => {
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    utils.studio.getMany.invalidate();
    utils.studio.getOne.invalidate({ id: videoId });
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog title="Upload a Thumbnail" open={isOpen} onOpenChange={onOpenChange}>
      <UploadDropzone endpoint={"thumbnailUploader"} input={{ videoId }} onClientUploadComplete={onUploadComplete} />
    </ResponsiveDialog>
  );
};

export default ThumbnailUploadModal;
