import { Box } from "@chakra-ui/react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import "./styles/style.css";
interface NewTokenProps {
    placeholder: string;
    value: string;
    handleTitleChange: (event: string) => void;
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
    "code-block"
];

const modules = {
    toolbar: {
        container:
            [
                [{ 'header': 1 }, { 'header': 2 }],
                ['bold', 'italic', 'strike'],
                ['blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link'],
                ['image'],
                ['video'],
                ['clean']
            ]
    }
};

function TextEditor(props: NewTokenProps) {
    const { placeholder, value, handleTitleChange } = props;
    return (
        <Box className="text-editor">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={handleTitleChange}
                placeholder={placeholder}
                modules={modules}
                formats={formats}
            />
        </Box>
    );
}

export { TextEditor };