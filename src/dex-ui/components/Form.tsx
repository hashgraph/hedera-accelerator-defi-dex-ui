import React, { PropsWithChildren } from "react";
import { useForm } from "react-hook-form";

interface FormElement {
  name: string;
}

interface FormProps extends PropsWithChildren {
  defaultValues?: any;
  onSubmit: (data: any) => void;
}

export function Form(props: FormProps) {
  const methods = useForm({ defaultValues: props.defaultValues });
  const { handleSubmit } = methods;

  return (
    <form onSubmit={handleSubmit(props.onSubmit)}>
      {React.Children.map(props.children, (child: React.ReactNode) => {
        if (!React.isValidElement<FormElement>(child)) {
          return child;
        }
        if (child.props.name) {
          return React.createElement(child.type, {
            ...{
              ...child.props,
              register: methods.register,
              key: child.props.name,
            },
          });
        }
        return child;
      })}
    </form>
  );
}
