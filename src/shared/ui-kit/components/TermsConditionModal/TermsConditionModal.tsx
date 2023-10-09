import { Button, Flex, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { Color, Text } from "@shared/ui-kit";
import { LocalStorageKeys } from "../constants";
import { useLocalStorage } from "@dex/hooks";

export function TermsConditionModal() {
  const { value: isTermsAndConditionsAccepted, setStorageValue } = useLocalStorage<boolean>(
    LocalStorageKeys.ACCEPTED_TERMS_AND_CONDITIONS,
    false
  );

  if (isTermsAndConditionsAccepted) {
    return <></>;
  }
  return (
    <Modal variant="termsConditionModal" isCentered isOpen={true} onClose={() => {}} trapFocus={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex direction="row" alignItems="center" justifyContent="center">
            <Text.P_Large_Semibold>Terms And Conditions</Text.P_Large_Semibold>
          </Flex>
        </ModalHeader>
        <ModalBody>
          <Flex direction="column" alignItems="flex-start" justifyContent="center" gap={5}>
            <Text.P_XSmall_Regular style={{ maxHeight: "16rem", overflowY: "auto" }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu metus in eros lobortis porta eget sed
              sapien. Maecenas tristique ultrices sapien id aliquam. Pellentesque sollicitudin bibendum risus. Lorem
              ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu metus in eros lobortis porta eget sed
              sapien. Maecenas tristique ultrices sapien id aliquam. Pellentesque sollicitudin bibendum risus. Lorem
              ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu metus in eros lobortis porta eget sed
              sapien. Maecenas tristique ultrices sapien id aliquam. Pellentesque sollicitudin bibendum risus. Lorem
              ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu metus in eros lobortis porta eget sed
              sapien. Maecenas tristique ultrices sapien id aliquam. Pellentesque sollicitudin bibendum risus. Lorem
              ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu metus in eros lobortis porta eget sed
              sapien. Maecenas tristique ultrices sapien id aliquam. Pellentesque sollicitudin bibendum risus. Lorem
              ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu metus in eros lobortis porta eget sed
              sapien. Maecenas tristique ultrices sapien id aliquam. Pellentesque sollicitudin bibendum risus.
            </Text.P_XSmall_Regular>
            <Button variant="primary" width="100%" onClick={() => setStorageValue(true)}>
              <Text.P_Medium_Medium color={Color.White_02}>Accept</Text.P_Medium_Medium>
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
