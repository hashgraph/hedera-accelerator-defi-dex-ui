import { useDropzone } from "react-dropzone";
import { Card, CardBody, Flex } from "@chakra-ui/react";
import { Text } from "../Text";
import { ReactElement, useState } from "react";
import { ToastErrorIcon, FileIcon, ToastSuccessIcon } from "@shared/ui-kit";

interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
  readonly webkitRelativePath: string;
}

enum UploadStatus {
  Empty = "empty",
  Error = "error",
  Success = "success",
}

const FileUploaderVariants: Readonly<Record<UploadStatus, string>> = {
  [UploadStatus.Empty]: "file-uploader-empty",
  [UploadStatus.Error]: "file-uploader-error",
  [UploadStatus.Success]: "file-uploader-success",
};

export type UploadedFile = {
  name: string;
  file: string;
};

interface FileUploaderProps {
  id: string;
  uploadedFile: UploadedFile;
  title: string;
  onHoverTitle: string;
  fileUploaderStyles?: any;
  disabled?: boolean;
  onFileRead: (file: string, name: string) => void;
  onFileReadFailed?: (reason: string) => void;
}

function FileUploader(props: FileUploaderProps) {
  const { id, uploadedFile, title, onHoverTitle, fileUploaderStyles, disabled, onFileRead, onFileReadFailed } = props;
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(
    uploadedFile?.file ? UploadStatus.Success : UploadStatus.Empty
  );

  const FileUploaderIcons: Readonly<Record<UploadStatus, ReactElement>> = {
    [UploadStatus.Empty]: <FileIcon h={12} w={12} marginTop="2px" />,
    [UploadStatus.Error]: <ToastErrorIcon h={12} w={12} />,
    [UploadStatus.Success]: <ToastSuccessIcon h={12} w={12} />,
  };

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => {
        if (onFileReadFailed) onFileReadFailed("File reading has aborted");
        setUploadStatus(UploadStatus.Empty);
      };
      reader.onerror = () => {
        if (onFileReadFailed) onFileReadFailed("File reading has failed");
        setUploadStatus(UploadStatus.Error);
      };
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onFileRead(dataUrl, file.name);
        setUploadStatus(UploadStatus.Success);
      };
      reader.readAsText(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "application/json": [".json"] },
    disabled: disabled,
  });

  return (
    <Card id={id} {...getRootProps()} variant={FileUploaderVariants[uploadStatus]} style={{ ...fileUploaderStyles }}>
      <CardBody>
        <Flex direction="column" gap="2" justifyContent="center" alignItems="center">
          {FileUploaderIcons[uploadStatus]}
          <input {...getInputProps()} />
          {isDragActive ? (
            <Text.P_Medium_Medium>{onHoverTitle}</Text.P_Medium_Medium>
          ) : (
            <Text.P_Medium_Medium>{uploadedFile?.name || title}</Text.P_Medium_Medium>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
}

export { FileUploader };
