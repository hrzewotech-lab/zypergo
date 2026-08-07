import React from 'react';
import { useParams } from 'react-router-dom';

export default function BlogPostPage() {
  const { slug } = useParams();
  
  return (
    <div className="py-24 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 capitalize">{slug?.replace(/-/g, ' ')}</h1>
        <div className="prose prose-lg">
          <p>Blog content goes here.</p>
        </div>
      </div>
    </div>
  );
}
