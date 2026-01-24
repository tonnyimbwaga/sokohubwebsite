"use client";

import {
  FiActivity,
  FiSettings,
  FiPackage,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiImage,
  FiGrid,
} from "react-icons/fi";
import { useCallback, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase/client";
import Button from "@/shared/Button/Button";
import Input from "@/shared/Input/Input";
import TextArea from "@/shared/TextArea/TextArea";
import SupabaseImageUpload from "@/shared/SupabaseImageUpload/SupabaseImageUpload";
import { getProductImageUrl } from "@/utils/product-images";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  meta_title?: string;
  meta_description?: string;
}

export default function CategoriesPage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    image_url: "",
    meta_title: "",
    meta_description: "",
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCategories((data as any) || []);
    } catch (error) {
      toast.error("Error loading categories");
      console.error("Error:", error);
    }
  }, []);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const revalidateHomepageCache = async () => {
    try {
      // Revalidate homepage category cache
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: ["homepage-categories"] }),
      });
    } catch (error) {
      console.warn("Cache revalidation failed:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await (supabase.from("categories").insert({
        name: newCategory.name,
        slug: createSlug(newCategory.name),
        description: newCategory.description,
        image_url: newCategory.image_url,
        meta_title: newCategory.meta_title,
        meta_description: newCategory.meta_description,
      } as any) as any);

      if (error) throw error;

      toast.success("Category created successfully");
      setNewCategory({
        name: "",
        description: "",
        image_url: "",
        meta_title: "",
        meta_description: "",
      });
      loadCategories();

      // Revalidate homepage cache
      await revalidateHomepageCache();
    } catch (error) {
      toast.error("Error creating category");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setLoading(true);

    try {
      const { error } = await (((supabase
        .from("categories")
        .update({
          name: editingCategory.name,
          slug: createSlug(editingCategory.name),
          description: editingCategory.description,
          image_url: editingCategory.image_url,
          meta_title: editingCategory.meta_title,
          meta_description: editingCategory.meta_description,
        } as any)
        .eq("id", editingCategory.id) as any) as any) as any);

      if (error) throw error;

      toast.success("Category updated successfully");
      setEditingCategory(null);
      loadCategories();

      // Revalidate homepage cache
      await revalidateHomepageCache();
    } catch (error) {
      toast.error("Error updating category");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const { error } = await (supabase.from("categories").delete().eq("id", id) as any);

      if (error) throw error;

      toast.success("Category deleted successfully");
      loadCategories();

      // Revalidate homepage cache
      await revalidateHomepageCache();
    } catch (error) {
      toast.error("Error deleting category");
      console.error("Error:", error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const handleImageUpload = (url: string) => {
    // The url returned from SupabaseImageUpload is already the full path (e.g. "categories/slug/image.png")
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, image_url: url });
    } else {
      setNewCategory({ ...newCategory, image_url: url });
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Product <span className="text-indigo-600">Categories</span>
          </h1>
          <p className="mt-4 text-lg font-medium text-slate-500 max-w-lg">
            Organize your collection with nested categories and rich descriptions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center justify-center">
            <FiActivity className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-slate-900">{categories.length} Total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Create/Edit Form */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white/60 p-10">
          <div className="flex items-center gap-4 mb-10">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${editingCategory ? "bg-amber-500 shadow-amber-200" : "bg-indigo-600 shadow-indigo-200"} shadow-lg text-white`}>
              {editingCategory ? <FiSettings className="h-6 w-6" /> : <FiPackage className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {editingCategory ? "Update Content" : "Create Category"}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {editingCategory ? `Editing: ${editingCategory.name}` : "Add new organization"}
              </p>
            </div>
          </div>

          <form
            onSubmit={editingCategory ? handleUpdate : handleCreate}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                    Display Name
                  </label>
                  <Input
                    type="text"
                    value={editingCategory ? editingCategory.name : newCategory.name}
                    onChange={(e) =>
                      editingCategory
                        ? setEditingCategory({ ...editingCategory, name: e.target.value })
                        : setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    placeholder="e.g. Action Figures"
                    required
                    className="w-full px-6 py-4 rounded-3xl border border-slate-200/50 bg-white/60 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300 text-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                    Visual Cover
                  </label>
                  <div className="p-4 rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50">
                    <SupabaseImageUpload
                      onChange={handleImageUpload}
                      value={
                        editingCategory
                          ? editingCategory.image_url
                          : newCategory.image_url
                      }
                      bucket="categories"
                      path={`categories/${editingCategory?.slug || createSlug(newCategory.name)}`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                  Description
                </label>
                <TextArea
                  value={editingCategory ? editingCategory.description || "" : newCategory.description}
                  onChange={(e) =>
                    editingCategory
                      ? setEditingCategory({ ...editingCategory, description: e.target.value })
                      : setNewCategory({ ...newCategory, description: e.target.value })
                  }
                  placeholder="Tell us about this category..."
                  rows={4}
                  className="w-full px-6 py-4 rounded-3xl border border-slate-200/50 bg-white/60 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                    SEO Title
                  </label>
                  <Input
                    type="text"
                    value={editingCategory ? editingCategory.meta_title || "" : newCategory.meta_title}
                    onChange={(e) =>
                      editingCategory
                        ? setEditingCategory({ ...editingCategory, meta_title: e.target.value })
                        : setNewCategory({ ...newCategory, meta_title: e.target.value })
                    }
                    placeholder="Meta title"
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200/50 bg-white/60 focus:ring-4 focus:ring-indigo-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                    SEO Description
                  </label>
                  <Input
                    type="text"
                    value={editingCategory ? editingCategory.meta_description || "" : newCategory.meta_description}
                    onChange={(e) =>
                      editingCategory
                        ? setEditingCategory({ ...editingCategory, meta_description: e.target.value })
                        : setNewCategory({ ...newCategory, meta_description: e.target.value })
                    }
                    placeholder="Meta description..."
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200/50 bg-white/60 focus:ring-4 focus:ring-indigo-50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className={`flex-1 h-16 rounded-3xl text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all duration-300 ${editingCategory
                  ? "bg-amber-500 shadow-amber-200 hover:bg-amber-600"
                  : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700"
                  } hover:-translate-y-1 active:scale-95`}
              >
                {loading ? "Processing..." : editingCategory ? "Update Category" : "Save Category"}
              </Button>

              {editingCategory && (
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="h-16 px-8 bg-slate-100 text-slate-600 rounded-3xl font-bold text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white/60 p-10 flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
              <FiGrid className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Live View</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Managed instances</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[800px] scrollbar-thin scrollbar-thumb-slate-200">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group flex items-center justify-between p-6 rounded-[32px] bg-white/30 hover:bg-white border border-transparent hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shadow-inner group-hover:bg-indigo-50 transition-colors">
                    {category.image_url ? (
                      <img
                        src={getProductImageUrl(category.image_url)}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <FiPackage className="h-8 w-8 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{category.name}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 max-w-[200px] truncate uppercase tracking-tight">
                      {category.description || "No description provided"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(category)}
                    className="h-12 w-12 rounded-2xl bg-white text-slate-600 border border-slate-100 shadow-sm flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300"
                  >
                    <FiSettings className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="h-12 w-12 rounded-2xl bg-white text-rose-500 border border-slate-100 shadow-sm flex items-center justify-center hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                <FiGrid className="h-16 w-16 mb-4 opacity-10" />
                <p className="font-bold uppercase tracking-widest text-[10px]">No classifications found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
