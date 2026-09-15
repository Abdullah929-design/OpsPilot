import apiClient from "./apiClient";

export interface CompanySettingsMap {
    allow_remote_work?: string;
    working_days?: string[];
    office_hours_start?: string;
    office_hours_end?: string;
    weekend?: string[];
    leave_year_start?: string;
    default_language?: string;
    default_currency?: string;
    email_signature?: string;
}

export const companySettingService = {
    getSettings: (): Promise<CompanySettingsMap> =>
        apiClient.get("/v1/company/settings").then((res) => res.data.data),

    updateSettings: (settings: CompanySettingsMap): Promise<CompanySettingsMap> =>
        apiClient.put("/v1/company/settings", { settings }).then((res) => res.data.data),
};
