import {
  Text,
  Button,
  Flex,
  Grid,
  GridItem,
  Spacer,
  Textarea,
  TabList,
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
  Box,
} from "@chakra-ui/react";
import { HIPProposal } from "../ProposalBuilder";
import { ChangeEvent, useState } from "react";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { Breadcrumb, CogIcon, Color, FormInput, FormTextArea } from "@dex-ui-components";
import ReactMarkdown from "react-markdown";
import { useTabFilters } from "@dex-ui/hooks";
import remarkGfm from "remark-gfm";
import { useLocation, useParams } from "react-router-dom";
import { Paths } from "@dex-ui/routes";
import { toMarkdown } from "mdast-util-to-markdown";
import { fromMarkdown } from "mdast-util-from-markdown";
import source from "../ProposalBuilder/HIPProposalForm.md";

enum HeadingTypes {
  "h1" = 1,
  "h2" = 2,
  "h3" = 3,
  "h4" = 4,
}

export function ProposalTemplateEditor() {
  const { control, register, getValues, setValue, handleSubmit } = useForm<{
    form: { node: any; value: string }[];
  }>({
    defaultValues: {
      form: [],
    },
  });

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "form", // unique name for your Field Array
  });
  const [renderedMD, setRenderedMD] = useState("");

  console.log(getValues(), fields);
  const { accountId: daoAccountId = "" } = useParams();
  const { tabIndex, handleTabChange } = useTabFilters(0);
  const [markdown, setMarkdown] = useState("");
  const location = useLocation();

  const currentDaoType = location.pathname.split("/").at(2) ?? "";
  const backTo = `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/${Paths.DAOs.Overview}`;

  function renderFormInput({ node, ...props }: any) {
    console.log(node, props);
    const text = (props?.children?.[0] as string) ?? "";
    /*     const splitIndex = title.indexOf("-");
    const label = title.slice(0, splitIndex).trim();
    const formHelperText = title.slice(splitIndex + 1).trim() ?? ""; */
    const tagName = node.tagName;

    if (tagName === "p") {
      setValue(`form.${props.index}.node`, {
        children: node.children,
        position: node.position,
        type: "paragraph",
      });

      const previousHeader = fromMarkdown(markdown)?.children[props.index - 1];
      const label =
        previousHeader.type === "heading"
          ? previousHeader.children[0].type === "text"
            ? previousHeader.children[0]?.value
            : "Invalid header"
          : "Invalid header";
      return (
        <FormTextArea<string>
          formHelperText={text}
          textAreaProps={{
            id: label.toLowerCase(),
            label,
            /*       placeholder: formHelperText, */
            /*    isTooltipVisible: true,
          tooltipLabel: text, */
            register: {
              ...register(`form.${props.index}.value`),
            },
          }}
        />
      );
    }

    setValue(`form.${props.index}`, {
      value: text,
      node: {
        children: node.children,
        position: node.position,
        depth: props.level,
        type: "heading",
      },
    });
    return <></>;
  }

  const handleMarkdownInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setMarkdown(inputValue);
  };

  async function onSubmit(data: any) {
    const mdast = data.form.map((child: any) => {
      if (child.node.type !== "paragraph") return child.node;
      child.node.children[0].value = child.value;
      return child.node;
    });

    /*   const tree = fromMarkdown(markdown); */
    /*  tree.data = data.form.map((entry: any) => entry.node); */
    console.log(mdast);
    // tree.children = data.form.map((entry: any) => entry.node);
    console.log(
      toMarkdown({
        type: "root",
        children: [...mdast],
      })
    );
    setRenderedMD(
      toMarkdown({
        type: "root",
        children: [...mdast],
      })
    );
  }

  return (
    <Flex direction="column" minH="100%" w="100%">
      <form>
        <Flex justifyContent="space-between" padding="1rem">
          <FormInput<string>
            flex="1"
            inputProps={{
              id: "templateName",
              label: "",
              type: "text",
              placeholder: "Enter a proposal template name",
              /*           register: {
                    ...register("linkToDiscussion", {
                      validate: (value) => isValidUrl(value) || "Invalid URL, Please try again.",
                    }),
                  }, */
            }}
            /* isInvalid={Boolean(errors?.linkToDiscussion)}
                errorMessage={errors?.linkToDiscussion && errors?.linkToDiscussion?.message} */
          />
          <Spacer flex="2" />
          <Flex direction="row" gap="4" alignItems="center">
            <Breadcrumb to={backTo} label={"Back to Dashboard"} />
            <Button onClick={handleSubmit(onSubmit)}>Submit Template</Button>
          </Flex>
        </Flex>
        <Grid h="100%" w="100%" templateRows="repeat(2, 1fr)" templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem rowSpan={2} colSpan={1} marginTop="51px">
            <Textarea
              h={`calc(100% - 51px)`}
              value={markdown}
              onChange={handleMarkdownInputChange}
              placeholder="Enter Markdown"
              size="sm"
            />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <Tabs
              isFitted
              onChange={handleTabChange}
              index={tabIndex}
              bg={Color.White_02}
              variant="dao-dashboard-tab"
              width="100%"
              height="40vh"
              paddingTop="0rem"
            >
              <Flex
                flex="row"
                justifyContent="right"
                paddingRight="1rem"
                borderBottom={`1px solid ${Color.Neutral._200}`}
              >
                <TabList>
                  <Tab>
                    <Flex style={{ padding: "0.75rem 1.25rem" }} gap={2.5} alignItems="center" justifyContent="center">
                      {/*      <CogIcon /> */}
                      <Box>Form</Box>
                    </Flex>
                  </Tab>
                  <Tab>
                    <Flex style={{ padding: "0.75rem 1.25rem" }} gap={2.5} alignItems="center" justifyContent="center">
                      {/*      <CogIcon /> */}
                      <Box>Markdown</Box>
                    </Flex>
                  </Tab>
                </TabList>
              </Flex>
              {/*           <ReactMarkdown
            children={markdown}
            components={{
              h1: ({ node, ...props }) => <Text textStyle="h1 medium" {...props} />,
              h2: ({ node, ...props }) => <Text textStyle="h2 medium" {...props} />,
              p: ({ node, ...props }) => {
                console.log({ node, ...props });
                return <>p</>;
              },
            }}
          /> */}
              <TabPanels minH="100%">
                <TabPanel padding="1rem 1rem 1rem 0">
                  <Flex layerStyle="wizard__form" direction="column" gap="1.3rem" minH="100%">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      children={markdown}
                      includeElementIndex={true}
                      allowedElements={["h1", "h2", "h3", "h4", "p"]}
                      components={{
                        h1: renderFormInput,
                        h2: renderFormInput,
                        h3: renderFormInput,
                        h4: renderFormInput,
                        p: renderFormInput,
                      }}
                    />
                  </Flex>
                </TabPanel>
                <TabPanel padding="1rem 0">
                  <Flex layerStyle="wizard__form" direction="column" gap="1.3rem">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      children={renderedMD}
                      allowedElements={["h1", "h2", "h3", "h4", "p"]}
                      components={{
                        h1: ({ node, ...props }) => <Text textStyle="h1 medium" {...props} />,
                        h2: ({ node, ...props }) => <Text textStyle="h2 medium" {...props} />,
                        h3: ({ node, ...props }) => <Text textStyle="h3 medium" {...props} />,
                        h4: ({ node, ...props }) => <Text textStyle="h4 medium" {...props} />,
                        p: ({ node, ...props }) => <Text textStyle="p medium regular" {...props} />,
                      }}
                    />
                  </Flex>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </GridItem>
        </Grid>
      </form>
    </Flex>
  );
}
