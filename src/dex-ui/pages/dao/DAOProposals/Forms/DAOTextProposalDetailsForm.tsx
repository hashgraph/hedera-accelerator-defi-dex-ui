import { Color, FormInput, FormTextArea } from "@dex-ui-components";
import { CreateDAOTextProposalForm } from "../types";
import { useFormContext } from "react-hook-form";
import { isValidUrl } from "@utils";
import { Flex, Spacer, Tab, TabList, TabPanel, TabPanels, Tabs, Textarea } from "@chakra-ui/react";
import { useTabFilters } from "@dex-ui/hooks";
import { DAOFormContainer } from "../../CreateADAO/forms/DAOFormContainer";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { ChangeEvent, useState } from "react";

export function DAOTextProposalDetailsForm() {
  const { tabIndex, handleTabChange } = useTabFilters(0);
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateDAOTextProposalForm>();
  const [markdown, setMarkdown] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setMarkdown(inputValue);
  };

  return (
    <>
      <Tabs isFitted onChange={handleTabChange} index={tabIndex} variant="unstyled" width="100%">
        <DAOFormContainer rest={{ padding: "0.1rem" }}>
          <TabList>
            <Tab
              color={Color.Neutral._500}
              _selected={{ color: "white", bg: Color.Grey_Blue._500, borderRadius: "4px" }}
            >
              Standard
            </Tab>
            <Tab
              color={Color.Neutral._500}
              _selected={{ color: "white", bg: Color.Grey_Blue._500, borderRadius: "4px" }}
            >
              Markdown
            </Tab>
            <Tab
              color={Color.Neutral._500}
              _selected={{ color: "white", bg: Color.Grey_Blue._500, borderRadius: "4px" }}
            >
              Custom (HIP)
            </Tab>
          </TabList>
        </DAOFormContainer>
        <Spacer paddingBottom="2rem" />
        <TabPanels>
          <TabPanel padding="1rem 0">
            <Flex direction="column" gap="1.3rem">
              <FormInput<"title">
                inputProps={{
                  id: "title",
                  label: "Title",
                  type: "text",
                  placeholder: "Enter title",
                  register: {
                    ...register("title", {
                      required: { value: true, message: "A title is required." },
                    }),
                  },
                }}
                isInvalid={Boolean(errors?.title)}
                errorMessage={errors?.title && errors?.title?.message}
              />
              <FormTextArea<"description">
                textAreaProps={{
                  id: "description",
                  label: "Description",
                  placeholder: "Add a description",
                  register: {
                    ...register("description", {
                      required: { value: true, message: "A description is required." },
                      validate: (value) => value.length <= 240 || "Maximum character count for the description is 240.",
                    }),
                  },
                }}
                isInvalid={Boolean(errors?.description)}
                errorMessage={errors?.description && errors?.description?.message}
              />
              <FormInput<"linkToDiscussion">
                inputProps={{
                  id: "linkToDiscussion",
                  label: "Link to discussion",
                  type: "text",
                  placeholder: "Enter URL",
                  register: {
                    ...register("linkToDiscussion", {
                      validate: (value) => isValidUrl(value) || "Invalid URL, Please try again.",
                    }),
                  },
                }}
                isInvalid={Boolean(errors?.linkToDiscussion)}
                errorMessage={errors?.linkToDiscussion && errors?.linkToDiscussion?.message}
              />
            </Flex>
          </TabPanel>
          <TabPanel padding="1rem 0">
            <Textarea value={markdown} onChange={handleInputChange} placeholder="Enter markdown" size="sm" />
            <Spacer padding="2rem" />
            <MarkdownPreview
              source={markdown}
              wrapperElement={{
                "data-color-mode": "light",
              }}
            />
          </TabPanel>
          <TabPanel padding="1rem 0">HIP</TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}
