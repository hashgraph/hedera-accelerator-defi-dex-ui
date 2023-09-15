import { extendTheme } from "@chakra-ui/react";
import { LayerStyles } from "./layers";
import { TextStyles } from "./text";
import { Color } from "./colors";
import { ModalStyles } from "../components/Modal";
import { ButtonStyles } from "../components/Button/buttonStyles";
import { InputStyles, NumberInputStyles } from "../components/Inputs";
import { CardStyles } from "../components/Card";
import { SelectStyles } from "../components/Select";
import { TooltipStyles } from "../components/Tooltip";
import { StepperStyles, StepsV2Theme } from "../components/Stepper";
import { TagStyles } from "../components/Tag";
import { TextAreaStyles } from "../components/TextArea";
import { TabsStyles } from "../components/Tabs";
import { LinkStyles } from "../components/Links";
import { ListStyles } from "../components/List";
import { TableStyles } from "../components/Table";

export const DefaultTheme = extendTheme({
  styles: {
    global: {
      body: {
        background: Color.Primary_Bg,
      },
    },
  },
  textStyles: TextStyles,
  layerStyles: LayerStyles,
  components: {
    Button: ButtonStyles,
    NumberInput: NumberInputStyles,
    Input: InputStyles,
    Card: CardStyles,
    Select: SelectStyles,
    Tooltip: TooltipStyles,
    Steps: StepsV2Theme,
    Tag: TagStyles,
    Textarea: TextAreaStyles,
    Tabs: TabsStyles,
    Link: LinkStyles,
    Modal: ModalStyles,
    List: ListStyles,
    Table: TableStyles,
    Stepper: StepperStyles,
  },
});
