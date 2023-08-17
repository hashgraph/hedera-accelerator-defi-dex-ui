import { TokenBalance } from "@dex/hooks";
import { Dispatch, SetStateAction, createContext, useContext } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

export interface FormTokenInputContextProps<FormType> {
  token: {
    tokenSymbolDisplay: string;
    balanceDisplay: string;
    decimals: string | undefined;
    assetListAccountId: string;
    initialSelectedTokenId: string | undefined;
    selectedToken: TokenBalance | undefined;
    setSelectedToken: Dispatch<SetStateAction<TokenBalance | undefined>>;
  };
  form: {
    amountFormId: string;
    tokenFormId: string;
  } & UseFormReturn<FormType & FieldValues>;
  modal: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
  };
}

const FormTokenInputContext = createContext<FormTokenInputContextProps<any> | null>(null);

export function useFormTokenInputContext<FormType>(): FormTokenInputContextProps<FormType> {
  const context = useContext<FormTokenInputContextProps<FormType> | null>(FormTokenInputContext);
  if (context === null) {
    throw new Error("useFormTokenInputContext must be used within a FormTokenInputProvider");
  }
  return context;
}

export default FormTokenInputContext;
