"use client";

import { useState } from "react";
import { TextField, IconButton, InputAdornment, TextFieldProps } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function PasswordInput(props: TextFieldProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <TextField
            {...props}
            type={showPassword ? "text" : "password"}
            slotProps={{
                ...props.slotProps,
                input: {
                    ...props.slotProps?.input,
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
}