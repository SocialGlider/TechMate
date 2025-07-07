"use client";
import React, { ChangeEvent, useState } from "react";

interface Props {
    name: string;
    label: string;
    placeholder?: string;
    value?: string;
    onChange?: (e:ChangeEvent<HTMLInputElement>)=>void;
    inputClassName?: string;
    labelClassName?: string;
    iconClassName?: string;
}

const PasswordInput = ({name, label,placeholder='Enter Password',value,onChange,inputClassName="",labelClassName="",iconClassName=""}:Props) => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = ()=>{
        setShowPassword(!showPassword);
    };

  return <>
       {label && (
        <label className={`font-semibold mb-2 block ${labelClassName}`}>
            {label}
        </label>
       )}
    </>;
};

export default PasswordInput