import { Icon } from "@chakra-ui/react";
import { Color } from "@dex-ui-components/themes";

interface RefreshProps<T> {
  fill?: string;
  options?: T;
}

export function RefreshIcon<T>(props: RefreshProps<T>) {
  return (
    <Icon viewBox="0 0 19 18" xmlns="http://www.w3.org/2000/svg" {...props.options}>
      <path
        d={`M17.6666 2.33367V7.33367M17.6666 7.33367H12.6666M17.6666 7.33367L13.8083 3.70034C12.6588 2.55012
                     11.1666 1.80466 9.55657 1.57629C7.94655 1.34792 6.30592 1.64902 4.8819 2.4342C3.45789 
                     3.21939 2.32765 4.44613 1.66149 5.92956C0.995338 7.41299 0.829363 9.07275 1.18858 
                     10.6587C1.54779 12.2447 2.41274 13.6709 3.65307 14.7226C4.8934 15.7742 6.44193 
                     16.3942 8.06529 16.4892C9.68866 16.5841 11.2989 16.1489 12.6534 15.2491C14.0079 
                     14.3493 15.0332 13.0336 15.5749 11.5003`}
        stroke={Color.Teal_01}
        fill="white"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
