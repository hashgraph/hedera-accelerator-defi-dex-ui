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
import { useFormContext } from "react-hook-form";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { CogIcon, Color, FormInput, FormTextArea } from "@dex-ui-components";
import ReactMarkdown from "react-markdown";
import { useTabFilters } from "@dex-ui/hooks";
import remarkGfm from "remark-gfm";

export function ProposalTemplateEditor() {
  /*   const {
    formState: { errors },
  } = useFormContext(); */
  const { tabIndex, handleTabChange } = useTabFilters(0);
  const [markdown, setMarkdown] = useState("");

  function renderFormInputHeader({ node, ...props }: any) {
    return <Text textStyle="p small medium" {...props} />;
  }

  const handleMarkdownInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setMarkdown(inputValue);
  };

  return (
    <Flex direction="column" h="100vh" w="100%">
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
        <Button>Submit Template</Button>
      </Flex>
      <Grid h="100%" w="100%" templateRows="repeat(2, 1fr)" templateColumns="repeat(2, 1fr)" gap={4}>
        <GridItem rowSpan={2} colSpan={1} marginTop="51px">
          <Textarea value={markdown} onChange={handleMarkdownInputChange} placeholder="Enter Markdown" size="sm" />
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          <Tabs
            isFitted
            onChange={handleTabChange}
            index={tabIndex}
            bg={Color.White_02}
            variant="dao-dashboard-tab"
            width="100%"
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
                    <CogIcon />
                    <Box>Form</Box>
                  </Flex>
                </Tab>
                <Tab>
                  <Flex style={{ padding: "0.75rem 1.25rem" }} gap={2.5} alignItems="center" justifyContent="center">
                    <CogIcon />
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
            <TabPanels>
              <TabPanel padding="1rem 1rem 1rem 0">
                <Flex layerStyle="wizard__form" direction="column" gap="1.3rem">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    children={markdown}
                    components={{
                      h1: ({ node, ...props }) => <Text textStyle="h1 medium" {...props} />,
                      h2: ({ node, ...props }) => <Text textStyle="h2 medium" {...props} />,
                      h3: ({ node, ...props }) => <Text textStyle="h3 medium" {...props} />,
                      h4: ({ node, ...props }) => <Text textStyle="h4 medium" {...props} />,
                      p: ({ node, ...props }) => {
                        console.log(node, props);
                        const title = (props?.children?.[0] as string) ?? "";
                        return (
                          <FormTextArea<string>
                            textAreaProps={{
                              id: "description",
                              label: "",
                              placeholder: title,
                              /*            register: {
                      ...register("description", {
                        required: { value: true, message: "A description is required." },
                        validate: (value) => value.length <= 240 || "Maximum character count for 
                        the description is 240.",
                      }),
                    }, */
                            }}
                            /*   isInvalid={Boolean(errors?.description)}
                  errorMessage={errors?.description && errors?.description?.message} */
                          />
                        );
                      },
                    }}
                  />
                </Flex>
              </TabPanel>
              <TabPanel padding="1rem 0">
                <Flex layerStyle="wizard__form" direction="column" gap="1.3rem">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    children={markdown}
                    components={{
                      h1: ({ node, ...props }) => <Text textStyle="h1 medium" {...props} />,
                      h2: ({ node, ...props }) => <Text textStyle="h2 medium" {...props} />,
                      h3: ({ node, ...props }) => <Text textStyle="h3 medium" {...props} />,
                      h4: ({ node, ...props }) => <Text textStyle="h4 medium" {...props} />,
                    }}
                  />
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>
      </Grid>
    </Flex>
  );
}
