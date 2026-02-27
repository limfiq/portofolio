'use client';

import { Editor } from '@tinymce/tinymce-react';

// basic TinyMCE configuration, adjust plugins/toolbars as needed
const initConfig = {
    height: 400,                // tinggi editor
    menubar: true,              // tampilkan menu di atas
    branding: false,            // sembunyikan branding TinyMCE
    toolbar:
        'undo redo | formatselect | bold italic backcolor | ' +
        'alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist outdent indent | removeformat | help',

    plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table paste code help wordcount'
    ],

    // editor-style.css bisa berisi style yang nantinya ada di konten
    content_css: '/styles/editor-content.css',

    // custom handler will POST blob to our server route which saves to Supabase
    images_upload_handler: async (blobInfo, success, failure) => {
        try {
            const form = new FormData();
            form.append('file', blobInfo.blob(), blobInfo.filename());
            const res = await fetch('/api/uploads', { method: 'POST', body: form });
            if (!res.ok) throw new Error('Upload request failed');
            const { url } = await res.json();
            success(url);
        } catch (err) {
            console.error('TinyMCE upload error', err);
            failure('Upload failed: ' + err.message);
        }
    },

    // kunci API (jika kamu gunakan cloud) dari .env
    api_key: process.env.NEXT_PUBLIC_TINYMCE_API_KEY,

    // callback tambahan
    setup: (editor) => {
        editor.on('init', () => console.log('TinyMCE ready'));
        editor.on('Change', () => {
            /* custom behavior on change */
        });
    }
};

export default function RichTextEditor({ value, onChange }) {
    return (
        <Editor
            value={value}
            onEditorChange={onChange}
            init={initConfig}
            className="bg-white"
        />
    );
}
