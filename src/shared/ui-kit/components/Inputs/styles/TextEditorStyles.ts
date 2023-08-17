/**
 * Text Editor styles for TextEditor components
 */

export const customTextEditorStyles = {
  ".ql-toolbar.ql-snow": {
    background: "#ffffff",
    border: "none",
    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1)",
    borderTopRadius: "8px",
    padding: "5px",
  },
  ".ql-editor": {
    minHeight: "300px",
    fontSize: "16px",
    lineHeight: "19px",
    fontWeight: "400",
    fontStyle: "normal",
  },
  ".ql-container.ql-snow": {
    backgroundColor: "#ffffff",
    border: "none",
    borderBottomRadius: "8px",
    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1)",
  },
  ".ql-editor.ql-blank::before": {
    fontSize: "16px",
    lineHeight: "19px",
    fontWeight: "400",
    fontStyle: "normal",
    color: "#cbcbcb",
  },
};

export const customErrorTextEditorStyles = {
  ".ql-toolbar.ql-snow": {
    background: "#ffffff",
    borderTopColor: "#FF0000",
    borderRightColor: "#FF0000",
    borderLeftColor: "#FF0000",
    borderTopRadius: "8px",
    borderWidth: "2px",
    padding: "5px",
  },
  ".ql-editor": {
    minHeight: "300px",
    fontSize: "16px",
    lineHeight: "19px",
    fontWeight: "400",
    fontStyle: "normal",
  },
  ".ql-container.ql-snow": {
    backgroundColor: "#ffffff",
    borderColor: "#FF0000",
    borderWidth: "2px",
    borderBottomRadius: "8px",
  },
  ".ql-editor.ql-blank::before": {
    fontSize: "16px",
    lineHeight: "19px",
    fontWeight: "400",
    fontStyle: "normal",
    color: "#cbcbcb",
  },
};

export const displayHTMLContentStyles = {
  ".ql-container.ql-snow": {
    backgroundColor: "#ffffff",
    border: "none",
  },
  ".ql-container.ql-snow .ql-editor": {
    padding: 0,
  },
};
