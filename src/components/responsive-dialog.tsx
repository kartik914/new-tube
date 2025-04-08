import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader } from "./ui/drawer";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";

interface ResponsiveDialogProps {
  children: React.ReactNode;
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
}

export const ResponsiveDialog = ({ children, open, title, onOpenChange }: ResponsiveDialogProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerHeader>{title}</DrawerHeader>
          </DrawerHeader>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogHeader>{title}</DialogHeader>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
