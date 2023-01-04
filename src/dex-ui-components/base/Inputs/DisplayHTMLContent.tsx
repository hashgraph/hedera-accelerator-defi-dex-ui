import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { chakra } from "@chakra-ui/react";
import { displayHTMLContentStyles } from "./styles/TextEditorStyles";

interface DisplayHTMLContentProps {
  id?: string;
  value: string;
}

const ChakraTextEditor = chakra(ReactQuill);

function DisplayHTMLContent(props: DisplayHTMLContentProps) {
  const { value, id } = props;
  return (
    <ChakraTextEditor
      id={id}
      value={value}
      readOnly={true}
      theme="snow"
      modules={{ toolbar: false }}
      sx={displayHTMLContentStyles}
    />
  );
}

export { DisplayHTMLContent };
