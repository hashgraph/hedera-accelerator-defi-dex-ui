import { extendTheme } from "@chakra-ui/react";
import {
  Color,
  TextStyles,
  LayerStyles,
  ButtonStyles,
  NumberInputStyles,
  InputStyles,
  CardStyles,
  SelectStyles,
  TooltipStyles,
  StepsV2Theme,
  TagStyles,
  TextAreaStyles,
  TabsStyles,
  LinkStyles,
  ModalStyles,
  ListStyles,
} from "@shared/ui-kit";

export const DEXTheme = extendTheme({
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
  },
});
