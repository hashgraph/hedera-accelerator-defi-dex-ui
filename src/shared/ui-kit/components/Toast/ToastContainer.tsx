import { ToastStyles } from "./toastStyles";
import styled from "@emotion/styled";
import { Slide, toast, ToastContainer as ToastifyContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TwentySeconds = 20 * 1000;
const MaxToastsDisplayed = 3;

const StyledToastContainer = styled(ToastifyContainer)`
  ${ToastStyles}
`;

export function ToastContainer() {
  return (
    <StyledToastContainer
      position={toast.POSITION.TOP_RIGHT}
      autoClose={TwentySeconds}
      icon={false}
      closeOnClick={false}
      pauseOnFocusLoss={true}
      pauseOnHover={true}
      hideProgressBar={false}
      transition={Slide}
      limit={MaxToastsDisplayed}
      newestOnTop={true}
      draggable={false}
      closeButton={false}
    />
  );
}
