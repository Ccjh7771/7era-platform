alter table public.website_settings
    add column complaint_phone text not null default '0122127277';

alter table public.website_settings
    add constraint website_settings_complaint_phone_format check (
        complaint_phone ~ '^01[0-9]{8,9}$'
    );
