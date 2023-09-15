import { TableContainer, Table, Tbody, Thead, Tr, Th, Td } from "@chakra-ui/react";
import { Color } from "@shared/ui-kit/themes";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "../Links";
import { Text } from "../Text";

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
        p: (props: any) => <Text.P_Medium_Regular {...props} />,
        a: (props: any) => {
          const { href, children } = props;
          return (
            <ExternalLink {...props} to={href}>
              <Text.P_Small_Semibold_Link>{children}</Text.P_Small_Semibold_Link>
            </ExternalLink>
          );
        },
        table: (props: any) => (
          <TableContainer borderRadius="8px" border={`1px solid ${Color.Neutral._200}`}>
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
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
