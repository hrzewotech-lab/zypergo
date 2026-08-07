import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/public/Navbar';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import useSEO from '../../hooks/useSEO';

export default function BlogListPage() {
  useSEO({
    title: 'Logistics Blog & Updates',
    description: 'Expert advice, industry trends, and product updates from the ZyperGo team. Learn how to optimize your supply chain.',
    keywords: 'logistics blog, supply chain optimization, delivery tech news'
  });

  const blogs = [
    {
      id: 1,
      title: "How to optimize your supply chain in 2026",
      desc: "Learn the best practices for reducing delivery times and improving logistics efficiency with modern tech.",
      category: "Logistics",
      date: "Aug 05, 2026",
      readTime: "5 min read",
      slug: "optimize-supply-chain",
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 2,
      title: "The future of intercity last-mile delivery",
      desc: "An in-depth look at how regional hubs and dynamic routing are changing the landscape.",
      category: "Innovation",
      date: "Jul 28, 2026",
      readTime: "8 min read",
      slug: "future-last-mile",
      color: "from-teal-400 to-emerald-500"
    },
    {
      id: 3,
      title: "Sustainable packaging for e-commerce",
      desc: "Eco-friendly materials that don't compromise on durability or cost.",
      category: "Sustainability",
      date: "Jul 15, 2026",
      readTime: "4 min read",
      slug: "sustainable-packaging",
      color: "from-orange-400 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />
      
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">Insights & News</span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Logistics Blog</h1>
            <p className="text-lg text-slate-600">Expert advice, industry trends, and product updates from the ZyperGo team.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <div key={blog.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 group flex flex-col">
                <div className={`h-48 md:h-56 bg-gradient-to-br ${blog.color} relative overflow-hidden`}>
                  {/* Decorative glass overlay inside image area */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900">
                    {blog.category}
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-4">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {blog.date}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {blog.readTime}</span>
                  </div>
                  <h3 className="font-bold text-2xl text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-slate-600 mb-8 flex-1 leading-relaxed">
                    {blog.desc}
                  </p>
                  <Link to={`/blog/${blog.slug}`} className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all mt-auto">
                    Read Article <ArrowRight size={18}/>
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
