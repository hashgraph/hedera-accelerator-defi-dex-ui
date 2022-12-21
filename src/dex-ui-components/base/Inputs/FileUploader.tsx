import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Text } from "@chakra-ui/react";
import { Color } from "../../../dex-ui-components";
interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
  readonly webkitRelativePath: string;
}

const defaultFileUploaderStyles = {
  bg: "white",
  width: "100%",
  textAlign: "center",
  justifyContent: "center",
  alignSelf: "center",
  border: "1px #31A9BD dashed",
  height: "102Px",
};
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
    <Card {...getRootProps()} style={{ ...defaultFileUploaderStyles, ...fileUploaderStyles }}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <Text color={Color.Blue_03}>{onHoverTitle}</Text>
      ) : (
        <>
          <Text color={Color.Blue_03}>{title}</Text>
          <Text color={Color.Blue_03}>{subTitle}</Text>
        </>
      )}
    </Card>
  );
}

export { FileUploader };
