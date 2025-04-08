import { ResponsiveDialog } from "@/components/responsive-dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";

interface BannerUploadModalProps {
  userId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const BannerUploadModal = ({ userId, isOpen, onOpenChange }: BannerUploadModalProps) => {
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    utils.users.getOne.invalidate({ id: userId });
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog title="Upload a banner" open={isOpen} onOpenChange={onOpenChange}>
      <UploadDropzone endpoint={"bannerUploader"} onClientUploadComplete={onUploadComplete} />
    </ResponsiveDialog>
  );
};

export default BannerUploadModal;
