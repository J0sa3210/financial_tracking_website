import { DialogHeader, DialogTitle } from "../ui/dialog";
import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios, { type AxiosProgressEvent, type AxiosRequestConfig } from "axios";
import { Progress } from "../ui/progress";

type uploadStatus = "idle" | "uploading" | "success" | "error";

interface CsvUploadHandlerProps {
  onSuccesfullUpload?: () => void;
}

export default function CsvUploadHandler(props: CsvUploadHandlerProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<uploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  function handeFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }

  async function handleFileUpload() {
    if (!file) return;

    setStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const options: AxiosRequestConfig = {
      url: "http://localhost:8000/transaction/upload_csv",
      data: formData,
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        const progress = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
        setUploadProgress(progress);
      },
    };

    await axios
      .post("http://localhost:8000/transaction/upload_csv", formData, options)
      .then(() => {
        setStatus("success");
        setUploadProgress(100);
        setFile(null);
        if (props.onSuccesfullUpload) {
          props.onSuccesfullUpload();
        }
      })
      .catch((error) => {
        setStatus("error");
        console.log(error);
        setErrorMsg(error.response?.data?.detail || "An error occurred while uploading the file.");
        setUploadProgress(0);
      });
  }

  return (
    <div>
      <DialogHeader className='px-2'>
        <DialogTitle className='pb-2'>Add transactions</DialogTitle>
      </DialogHeader>
      <Input
        type='file'
        accept='.csv'
        id='file'
        onChange={handeFileChange}
      />
      {file && status === "idle" && (
        <div className=' pt-4 flex justify-between items-center'>
          <span className='flex gap-2'>
            <p className='font-semibold'>File size:</p>
            <p> {(file.size / 1024).toFixed(2)} Kb</p>
          </span>
          <Button
            size='sm'
            onClick={handleFileUpload}>
            Upload
          </Button>
        </div>
      )}
      {status === "uploading" && (
        <div>
          <div className='pl-2 pt-1 text-yellow-400'>Uploading file...</div>
          <Progress
            value={uploadProgress}
            className='mt-2'
          />
        </div>
      )}
      {status === "error" && (
        <div className='pl-2 pt-1 text-red-600'>{errorMsg || "An error occurred while uploading the file."}</div>
      )}
      {status === "success" && (
        <div className='pl-2 pt-1 text-green-600 font-semibold'>Succesfully uploaded file...</div>
      )}
    </div>
  );
}
