import { TableContainer, Table, Tbody, Thead, Tr, Th, Td } from "@chakra-ui/react";
import { Color, TextStyles } from "@shared/ui-kit/themes";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "../Links";
import { Text } from "../Text";
import React, { ReactElement } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

const TableContainerStyles = { borderRadius: "8px", border: `1px solid ${Color.Neutral._200}` };

const ImageStyles = {
  minHeight: "5rem",
  borderRadius: "0.375rem",
  border: `1px solid ${Color.Neutral._200}`,
  background: Color.Neutral._50,
};

const ListStyles = {
  paddingLeft: "1rem",
  ...TextStyles["p small regular"],
};

const ListItemStyles = { marginBottom: "0.125rem" };

const BlockQuoteStyles = {
  borderLeft: `6px solid ${Color.Neutral._300}`,
  background: Color.Neutral._100,
  padding: "0.5rem 1.5rem 0.5rem 0rem",
};

const BlockQuoteTextStyles = { marginLeft: "0.5rem" };

export const CodeStyles = {
  backgroundColor: Color.Neutral._200,
  padding: "0.05rem 0.2rem",
  borderRadius: "0.25rem",
  ...TextStyles["overline small"],
  color: "inherit",
  textTransform: "none",
};

const CodeBlockStyles = {
  padding: "0.25rem 0.5rem",
  borderRadius: "0.375rem",
  border: `1px solid ${Color.Neutral._200}`,
  backgroundColor: Color.Neutral._200,
  textWrap: "wrap",
};

interface MarkdownRendererProps {
  markdown: string;
}

export function MarkdownRenderer(props: MarkdownRendererProps) {
  const { markdown } = props;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={{
        h1: (props: any) => <Text.H1_Medium {...props} />,
        h2: (props: any) => <Text.H2_Medium {...props} />,
        h3: (props: any) => <Text.H3_Medium {...props} />,
        h4: (props: any) => <Text.H4_Medium {...props} />,
        h5: (props: any) => <Text.H5_Medium {...props} />,
        h6: (props: any) => <Text.H6_Medium {...props} />,
        p: (props: any) => <Text.P_Medium_Regular {...props} />,
        a: (props: any) => {
          const { href, children } = props;
          return (
            <ExternalLink {...props} to={href}>
              <Text.P_Small_Semibold_Link
                className="markdown-link"
                style={{
                  display: "inline",
                }}
              >
                {children}
              </Text.P_Small_Semibold_Link>
            </ExternalLink>
          );
        },
        table: (props: any) => (
          <TableContainer style={TableContainerStyles}>
            <Table {...props} />
          </TableContainer>
        ),
        tbody: (props: any) => <Tbody {...props} />,
        thead: (props: any) => <Thead {...props} />,
        tr: (props: any) => <Tr {...props} />,
        th: (props: any) => (
          <Th>
            <Text.P_Small_Semibold {...props}></Text.P_Small_Semibold>
          </Th>
        ),
        td: (props: any) => (
          <Td>
            <Text.P_Small_Regular {...props}></Text.P_Small_Regular>
          </Td>
        ),
        blockquote: (props: any) => (
          <blockquote {...props} style={BlockQuoteStyles}>
            {props.children
              .filter((quotes: unknown) => React.isValidElement(quotes))
              .map((quote: ReactElement, index: number) => (
                <Text.P_Small_Regular {...quote.props} key={index} style={BlockQuoteTextStyles}></Text.P_Small_Regular>
              ))}
          </blockquote>
        ),
        ol: (props: any) => (
          <ol {...props} style={ListStyles}>
            {props.children
              .filter((listItem: unknown) => React.isValidElement(listItem))
              .map((listItem: ReactElement, index: number) => (
                <li {...listItem.props} key={index} style={ListItemStyles}>
                  <Text.P_Small_Regular {...listItem.props}></Text.P_Small_Regular>
                </li>
              ))}
          </ol>
        ),
        ul: (props: any) => (
          <ul {...props} style={ListStyles}>
            {props.children
              .filter((listItem: unknown) => React.isValidElement(listItem))
              .map((listItem: ReactElement, index: number) => (
                <li {...listItem.props} key={index} style={ListItemStyles}>
                  <Text.P_Small_Regular {...listItem.props}></Text.P_Small_Regular>
                </li>
              ))}
          </ul>
        ),
        code: (props: any) => {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          if (match) {
            return (
              <SyntaxHighlighter {...rest} language={match[1]} PreTag="div">
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          }
          return <code {...props} style={CodeStyles}></code>;
        },
        img: (props: any) => <img {...props} style={ImageStyles} src="" data-src={props.src}></img>,
        pre: (props: any) => <pre {...props} style={CodeBlockStyles}></pre>,
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
