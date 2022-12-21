import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Text } from "@chakra-ui/react";
import { customFileUploaderStyles } from "./styles/FileUploaderStyles";

interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
  readonly webkitRelativePath: string;
}

interface FileUploaderProps {
  title: string;
  subTitle: string;
  onHoverTitle: string;
  fileUploaderStyles?: any;
  disabled?: boolean;
  onFileRead: (file: string, fileName: string) => void;
  onFileReadFailed?: (reason: string) => void;
}

function FileUploader(props: FileUploaderProps) {
  const { title, subTitle, onHoverTitle, fileUploaderStyles, disabled, onFileRead, onFileReadFailed } = props;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onabort = () => {
          if (onFileReadFailed) onFileReadFailed("File reading has aborted");
        };
        reader.onerror = () => {
          if (onFileReadFailed) onFileReadFailed("File reading has failed");
        };
        reader.onload = () => {
          const dataUrl = reader.result as string;
          onFileRead(dataUrl, file.name);
        };
        reader.readAsText(file);
      });
    },
    [onFileRead, onFileReadFailed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "application/json": [".json"] },
    disabled: disabled ?? false,
  });

  return (
    <Card
      {...getRootProps()}
      variant="outline"
      sx={customFileUploaderStyles}
      style={{ justifyContent: "center", ...fileUploaderStyles }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <Text color={"#31A9BD"}>{onHoverTitle}</Text>
      ) : (
        <>
          <Text color={"#31A9BD"}>{title}</Text>
          <Text color={"#31A9BD"}>{subTitle}</Text>
        </>
      )}
    </Card>
  );
}

export { FileUploader };
