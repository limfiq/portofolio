"use client";

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Import ReactQuill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-50 animate-pulse rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">Loading Editor...</div>,
});

const QuillEditor = ({ value, onChange, placeholder = "Mulai menulis di sini..." }) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'color', 'background',
    'link', 'image'
  ];

  return (
    <div className="quill-wrapper bg-white rounded-lg">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-64 mb-12" // Fixed height for the editor area
      />
      <style jsx global>{`
        .quill-wrapper .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          font-family: inherit;
          font-size: 1rem;
        }
        .quill-wrapper .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #f9fafb;
        }
        .quill-wrapper .ql-editor {
          min-height: 200px;
        }
      `}</style>
    </div>
  );
};

export default QuillEditor;
