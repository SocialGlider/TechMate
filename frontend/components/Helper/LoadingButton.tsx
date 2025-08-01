import React from "react";
import { Button } from "../ui/button";
import { Loader } from "lucide-react";

interface Props extends React.ComponentPropsWithoutRef<typeof Button>{
  isLoading: boolean;
  children: React.ReactNode;
}

const LoadingButton = ({isLoading,children, ...props}:Props) => {
  return (<Button disabled={isLoading} {...props}>
    {isLoading? <Loader className="animate-spin mr-2" />:null}
    {children}
  </Button>
  );
};

export default LoadingButton;