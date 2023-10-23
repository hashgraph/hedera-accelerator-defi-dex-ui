import { Divider, Flex, Spacer, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { ExternalLink, Color, CopyTextButton, Text, CodeStyles } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import {
  CreateDAOProposalContext,
  CreateDAOGenericProposalForm,
  DAOProposalType,
  Argument,
  TupleArgument,
} from "../../types";
import { useDexContext } from "@dex/hooks";
import { useOutletContext } from "react-router-dom";
import { SolidityTuple } from "abitype/zod";

interface ArgumentsTableRowProps {
  arg: Argument;
  level?: number;
}

function ArgumentsTableRow(props: ArgumentsTableRowProps) {
  const { arg, level = 0 } = props;
  return (
    <>
      <Tr>
        <Td padding="0.75rem 0.25rem" paddingLeft={`${level}rem`} wordBreak="break-word" minWidth="200px">
          <Text.P_Small_Regular color={Color.Neutral._700}>{`${arg.name} (${arg.type})`}</Text.P_Small_Regular>
        </Td>
        <Td padding="0.75rem 0.25rem" paddingLeft={`${level}rem`}>
          <Text.P_Small_Regular
            wordBreak="break-word"
            color={Color.Neutral._700}
          >{`${arg.transformedValue}`}</Text.P_Small_Regular>
        </Td>
      </Tr>
      {SolidityTuple.safeParse(arg.type).success ? (
        (arg as TupleArgument).components.map((tupleArgument: Argument, index: number) => (
          <ArgumentsTableRow key={`${level + 1}-${index}`} arg={tupleArgument} level={level + 1} />
        ))
      ) : (
        <></>
      )}
    </>
  );
}

export function DAOGenericProposalReviewForm() {
  const { proposalType } = useOutletContext<CreateDAOProposalContext>();
  const { getValues, setValue } = useFormContext<CreateDAOGenericProposalForm>();
  const { title, description, linkToDiscussion, functionName, functionArguments } = getValues();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";

  if (proposalType !== DAOProposalType.Generic) {
    setValue("type", DAOProposalType.Generic);
  }

  return (
    <Flex gap="1.3rem" direction="column">
      <Flex direction="column" gap="2">
        <Text.P_Small_Semibold>{title}</Text.P_Small_Semibold>
        <Text.P_Small_Regular>{description}</Text.P_Small_Regular>
        <ExternalLink to={linkToDiscussion}>
          <Text.P_Small_Semibold_Link>{linkToDiscussion}</Text.P_Small_Semibold_Link>
        </ExternalLink>
      </Flex>
      <Divider />
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium>Function to Execute</Text.P_Small_Medium>
        <Flex gap="2" alignItems="center">
          <code style={{ ...CodeStyles, textTransform: "none" }}>{functionName}</code>
        </Flex>
        <Spacer />
        <TableContainer whiteSpace="normal">
          <Table>
            <Thead>
              <Tr>
                <Th padding="0.75rem 0.25rem">
                  <Text.P_Small_Medium>{`Arguments (${functionArguments.length})`}</Text.P_Small_Medium>
                </Th>
                <Th padding="0.75rem 0.25rem">
                  <Text.P_Small_Medium>Value</Text.P_Small_Medium>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {functionArguments.map((functionArgument: Argument, index: number) => (
                <ArgumentsTableRow key={`0-${index}`} arg={functionArgument} />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium>Submitted By</Text.P_Small_Medium>
        <Flex gap="2" alignItems="center">
          <Text.P_Small_Regular color={Color.Neutral._700}>{walletId}</Text.P_Small_Regular>
          <CopyTextButton iconSize="17" onClick={() => {}} />
        </Flex>
      </Flex>
    </Flex>
  );
}
