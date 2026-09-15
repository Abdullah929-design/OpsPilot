import React from "react";
import { Avatar } from "@mui/material";

interface EmployeeAvatarProps {
    firstName?: string;
    lastName?: string;
    photoUrl?: string | null;
    size?: number;
}

export default function EmployeeAvatar({ firstName = "", lastName = "", photoUrl, size = 40 }: EmployeeAvatarProps) {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

    const stringToColor = (string: string) => {
        let hash = 0;
        let i;
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = "#";
        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        return color;
    };

    const bgColor = stringToColor(`${firstName} ${lastName}`);

    return (
        <Avatar
            src={photoUrl || undefined}
            alt={`${firstName} ${lastName}`}
            sx={{
                width: size,
                height: size,
                bgcolor: photoUrl ? "transparent" : bgColor,
                color: "#ffffff",
                fontSize: size * 0.4,
                fontWeight: 600,
            }}
        >
            {initials || "?"}
        </Avatar>
    );
}
