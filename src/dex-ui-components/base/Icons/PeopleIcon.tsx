import { Icon } from "@chakra-ui/react";
import { Color } from "../../themes";

interface PeopleIconProps<T> {
  options?: T;
  stroke?: string;
}

export function PeopleIcon<T>(props: PeopleIconProps<T>) {
  const { stroke = Color.Neutral._900, options } = props;
  return (
    <Icon width="6" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...options}>
      <path
        d="M14.1663 16.5V14.8333C14.1663 13.9493 13.8152 13.1014 13.19 12.4763C12.5649 
        11.8512 11.7171 11.5 10.833 11.5H4.16634C3.28229 11.5 2.43444 11.8512 1.80932 
        12.4763C1.1842 13.1014 0.833008 13.9493 0.833008 14.8333V16.5M19.1663 
        16.5V14.8333C19.1658 14.0948 18.92 13.3773 18.4675 12.7936C18.015 12.2099
         17.3814 11.793 16.6663 11.6083M13.333 1.60833C14.05 1.79192 14.6855 2.20892 
         15.1394 2.79359C15.5932 3.37827 15.8395 4.09736 15.8395 4.8375C15.8395 5.57764
          15.5932 6.29673 15.1394 6.88141C14.6855 7.46608 14.05 7.88308 13.333 
          8.06667M10.833 4.83333C10.833 6.67428 9.34062 8.16667 7.49967 8.16667C5.65873
          8.16667 4.16634 6.67428 4.16634 4.83333C4.16634 2.99238 5.65873 1.5 7.49967 
          1.5C9.34062 1.5 10.833 2.99238 10.833 4.83333Z"
        stroke={stroke}
        stroke-width="1.66667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Icon>
  );
}
