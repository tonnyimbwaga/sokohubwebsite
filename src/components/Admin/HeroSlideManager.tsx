"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import SupabaseImageUpload from "@/shared/SupabaseImageUpload/SupabaseImageUpload";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import Image from "next/image";
import { getProductImageUrl } from "@/utils/product-images";

interface HeroSlide {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url: string;
  button_text: string;
  display_order: number;
  active: boolean;
}

export default function HeroSlideManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<HeroSlide>>({});
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    setLoading(true);
    const { data, error } = await supabase
      .from("hero_slides")
      .select(
        "id, title, subtitle, image_url, link_url, button_text, display_order, active",
      )
      .order("display_order", { ascending: true });

    if (error) {
      // setError('Failed to fetch slides');
      console.error("Error:", error);
    } else {
      setSlides(data || []);
    }
    setLoading(false);
  }

  const handleEdit = (slideId: number) => {
    const slide = slides.find((s) => s.id === slideId);
    if (slide) {
      setEditingSlideId(slideId);
      if (slide) {
        setFormData({ ...slide });
      }
    } else {
      // setError(`Slide with ID ${slideId} not found.`);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = (url: string) => {
    // The url from SupabaseImageUpload already includes the folder structure
    setFormData((prev) => ({ ...prev, image_url: url }));
  };

  async function handleSaveSlide(slide: Partial<HeroSlide>) {
    if (editingSlideId) {
      const { error } = await supabase
        .from("hero_slides")
        .update(slide)
        .eq("id", editingSlideId);

      if (!error) {
        setEditingSlideId(null);
        setFormData({});
        fetchSlides();
      }
    } else {
      const { error } = await supabase.from("hero_slides").insert([
        {
          ...slide,
          display_order: slides.length,
        },
      ]);

      if (!error) {
        setFormData({});
        fetchSlides();
      }
    }
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;

    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    if (!reorderedItem) return;
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all affected slides
    const updates = items.map((slide, index) => ({
      id: slide.id,
      display_order: index,
    }));

    setSlides(items);

    // Batch update all slides with new display_order
    for (const update of updates) {
      await supabase
        .from("hero_slides")
        .update({ display_order: update.display_order })
        .eq("id", update.id);
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => {
          setEditingSlideId(null);
          setFormData({
            title: "",
            subtitle: "",
            image_url: "",
            link_url: "#",
            button_text: "Shop Now",
            display_order: slides.length,
            active: true,
          });
        }}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600"
      >
        Add New Slide
      </button>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">
          {editingSlideId ? "Edit Slide" : "Add New Slide"}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveSlide(formData);
          }}
        >
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <textarea
                name="subtitle"
                value={formData.subtitle || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link URL</label>
              <input
                type="text"
                name="link_url"
                value={formData.link_url || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Button Text
              </label>
              <input
                type="text"
                name="button_text"
                value={formData.button_text || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <SupabaseImageUpload
                onChange={handleImageUpload}
                value={formData.image_url}
                bucket="hero-slides"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Active</label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active ?? true}
                onChange={handleInputChange}
                className="mb-4"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingSlideId ? "Update Slide" : "Add Slide"}
            </button>
            {editingSlideId && (
              <button
                type="button"
                onClick={() => {
                  setEditingSlideId(null);
                  setFormData({});
                }}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <DragDropContext onDragEnd={onDragEnd} enableDefaultSensors={true}>
        <Droppable
          droppableId="slides"
          isDropDisabled={false}
          isCombineEnabled={false}
          ignoreContainerClipping={false}
          mode="standard"
          type="DEFAULT"
        >
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {slides.map((slide, index) => (
                <Draggable
                  key={String(slide.id)}
                  draggableId={String(slide.id)}
                  index={index}
                  isDragDisabled={false}
                  disableInteractiveElementBlocking={false}
                  shouldRespectForcePress={false}
                >
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                          <Image
                            src={getProductImageUrl(slide.image_url)}
                            alt={slide.title}
                            fill
                            className="object-cover rounded"
                            sizes="64px"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{slide.title}</h4>
                          <p className="text-sm text-gray-500">
                            {slide.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${slide.active ? "bg-green-500" : "bg-gray-300"
                            }`}
                        />
                        <button
                          onClick={() => handleEdit(slide.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
