import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { chakra } from "@chakra-ui/react";
import { displayHTMLContentEditorStyles } from "./styles/TextEditorStyles";

interface TextEditorProps {
  value: string;
}

const modules = {
  toolbar: false,
};

const ChakraTextEditor = chakra(ReactQuill);

function DisplayHTMLContent(props: TextEditorProps) {
  const { value } = props;
  return (
    <ChakraTextEditor
      value={value}
      readOnly={true}
      theme="snow"
      modules={modules}
      sx={displayHTMLContentEditorStyles}
    />
  );
}

export { DisplayHTMLContent };
