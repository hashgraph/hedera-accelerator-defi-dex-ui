import { Icon } from "@chakra-ui/react";

interface TextIconProps<T> {
  fill: string;
  options?: T;
}

export function TextIcon<T>(props: TextIconProps<T>) {
  return (
    <Icon viewBox="0 0 22 34" xmlns="http://www.w3.org/2000/svg" {...props.options}>
      <path
        d={`M18.3165 1.31732C17.6832 0.683984 16.8332 0.333984 15.9498 0.333984H3.99984C2.1665 
        0.333984 0.666504 1.83398 0.666504 3.66732V30.334C0.666504 32.1673 2.14984 33.6673 3.98317 
        33.6673H23.9998C25.8332 33.6673 27.3332 32.1673 27.3332 30.334V11.7173C27.3332 10.834 26.9832 
        9.98398 26.3498 9.36732L18.3165 1.31732ZM18.9998 27.0007H8.99984C8.08317 27.0007 7.33317 26.2507 
        7.33317 25.334C7.33317 24.4173 8.08317 23.6673 8.99984 23.6673H18.9998C19.9165 23.6673 20.6665 
        24.4173 20.6665 25.334C20.6665 26.2507 19.9165 27.0007 18.9998 27.0007ZM18.9998 20.334H8.99984C8.08317 
        20.334 7.33317 19.584 7.33317 18.6673C7.33317 17.7507 8.08317 17.0007 8.99984 17.0007H18.9998C19.9165 
        17.0007 20.6665 17.7507 20.6665 18.6673C20.6665 19.584 19.9165 20.334 18.9998 20.334ZM15.6665 
        10.334V2.83398L24.8332 12.0007H17.3332C16.4165 12.0007 15.6665 11.2507 15.6665 10.334Z`}
        fill={props.fill}
      />
    </Icon>
  );
}
