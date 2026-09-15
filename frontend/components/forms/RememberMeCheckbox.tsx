"use client";

import { FormControlLabel, Checkbox } from "@mui/material";

interface RememberMeProps {
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function RememberMeCheckbox({ checked, onChange }: RememberMeProps) {
    return (
        <FormControlLabel
            control={<Checkbox checked={checked} onChange={onChange} name="remember" color="primary" />}
            label="Remember me"
        />
    );
}
