alter table public.chat_messages
    add column attachment_path text,
    add column attachment_mime_type text;

alter table public.chat_messages
    drop constraint if exists chat_messages_body_check;

alter table public.chat_messages
    add constraint chat_messages_content_check check (
        char_length(trim(body)) <= 4000
        and (
            char_length(trim(body)) >= 1
            or attachment_path is not null
        )
    ),
    add constraint chat_messages_attachment_check check (
        (attachment_path is null and attachment_mime_type is null)
        or (
            attachment_path is not null
            and attachment_mime_type in (
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif'
            )
        )
    );

insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'chat-attachments',
    'chat-attachments',
    false,
    4194304,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
