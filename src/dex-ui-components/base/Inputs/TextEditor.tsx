import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { chakra } from "@chakra-ui/react";
import { customTextEditorStyles } from "./styles/TextEditorStyles";
interface NewTokenProps {
  placeholder: string;
  textEditorValue: string;
  handleTextValueChange: (event: string) => void;
}

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "align",
  "strike",
  "script",
  "blockquote",
  "background",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "color",
  "code-block",
];

const modules = {
  toolbar: {
    container: [
      [{ header: 1 }, { header: 2 }],
      ["bold", "italic", "strike"],
      ["blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["image"],
      ["video"],
      ["clean"],
    ],
  },
};

const ChakraTextEditor = chakra(ReactQuill);

function TextEditor(props: NewTokenProps) {
  const { placeholder, textEditorValue, handleTextValueChange } = props;
  return (
    <ChakraTextEditor
      theme="snow"
      value={textEditorValue}
      onChange={handleTextValueChange}
      placeholder={placeholder}
      modules={modules}
      formats={formats}
      sx={customTextEditorStyles}
    />
  );
}

export { TextEditor };
