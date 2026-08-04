create table public.website_settings (
    id smallint primary key default 1,
    site_name text not null,
    short_name text not null,
    brand_label text not null,
    tagline text not null,
    logo_path text,
    primary_cta_label text not null,
    primary_cta_url text not null,
    support_heading text not null,
    support_description text not null,
    whatsapp_url text not null,
    heylink_url text not null,
    support_email text not null,
    seo_title text not null,
    seo_description text not null,
    site_url text not null,
    copyright_text text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint website_settings_singleton check (id = 1),
    constraint website_settings_site_name_length check (
        char_length(site_name) between 2 and 100
    ),
    constraint website_settings_short_name_length check (
        char_length(short_name) between 1 and 30
    ),
    constraint website_settings_brand_label_length check (
        char_length(brand_label) between 1 and 40
    ),
    constraint website_settings_tagline_length check (
        char_length(tagline) between 5 and 240
    ),
    constraint website_settings_cta_label_length check (
        char_length(primary_cta_label) between 2 and 40
    ),
    constraint website_settings_support_heading_length check (
        char_length(support_heading) between 5 and 120
    ),
    constraint website_settings_support_description_length check (
        char_length(support_description) between 10 and 500
    ),
    constraint website_settings_seo_title_length check (
        char_length(seo_title) between 5 and 70
    ),
    constraint website_settings_seo_description_length check (
        char_length(seo_description) between 20 and 180
    ),
    constraint website_settings_copyright_length check (
        char_length(copyright_text) between 5 and 160
    ),
    constraint website_settings_support_email_format check (
        support_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    ),
    constraint website_settings_primary_cta_url_format check (
        primary_cta_url = '#'
        or primary_cta_url ~ '^#[a-zA-Z0-9-]+$'
        or primary_cta_url ~ '^/[a-zA-Z0-9/?#&=._%-]*$'
        or primary_cta_url ~ '^https?://'
    ),
    constraint website_settings_whatsapp_url_format check (
        whatsapp_url = '#' or whatsapp_url ~ '^https?://'
    ),
    constraint website_settings_heylink_url_format check (
        heylink_url = '#' or heylink_url ~ '^https?://'
    ),
    constraint website_settings_site_url_format check (
        site_url ~ '^https?://'
    )
);

alter table public.website_settings enable row level security;

revoke all on table public.website_settings from anon, authenticated;
grant select on table public.website_settings to anon, authenticated;
grant select, insert, update, delete on table public.website_settings to service_role;

create policy "Public can read website settings"
    on public.website_settings
    for select
    to anon, authenticated
    using (id = 1);

insert into public.website_settings (
    id,
    site_name,
    short_name,
    brand_label,
    tagline,
    primary_cta_label,
    primary_cta_url,
    support_heading,
    support_description,
    whatsapp_url,
    heylink_url,
    support_email,
    seo_title,
    seo_description,
    site_url,
    copyright_text
)
values (
    1,
    '7ERA Platform',
    '7ERA',
    'Platform',
    'Premium gaming platform providing trusted brands, premium experiences and reliable customer support.',
    'Join Now',
    '/#contact',
    'Need assistance with our platform?',
    'Our support team is available to help with account enquiries, platform access, game downloads and general assistance.',
    '#',
    '#',
    'support@7era.com',
    '7ERA Platform',
    'Premium gaming platform featuring trusted brands, mobile game downloads and 24/7 customer support.',
    'https://7era-platform.vercel.app',
    '© 2018 7ERA Platform. All Rights Reserved.'
);

insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'site-assets',
    'site-assets',
    true,
    2097152,
    array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
