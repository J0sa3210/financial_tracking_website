import { Button } from "../ui/button";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import CsvUploadHandler from "../upload_data_handler/csv_upload_handler";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function InputDialog() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className='flex py-2 justify-end'>
      <Dialog
        open={showDialog}
        onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button className='bg-primary text-primary-foreground text-lg hover:bg-primary/90'>
            <FaPlus />
            Transactions
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogDescription />
          <Tabs defaultValue='csv'>
            <TabsList>
              <TabsTrigger value='csv'>CSV</TabsTrigger>
              <TabsTrigger value='json'>JSON</TabsTrigger>
            </TabsList>
            <TabsContent
              value='csv'
              className='pt-4'>
              <CsvUploadHandler />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
