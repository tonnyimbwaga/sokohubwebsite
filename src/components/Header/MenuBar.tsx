"use client";

import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";
import React, { Fragment, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

import { useCategories } from "@/hooks/useCategories";

import { siteConfig } from "@/config/site";

const MenuBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories, isLoading } = useCategories();

  const closeMenu = () => setIsOpen(false);

  // Handle loading state
  if (isLoading) {
    return (
      <button className="flex items-center gap-2 text-gray-700" disabled>
        <FaBars className="text-2xl" />
        <span className="hidden sm:inline">Loading...</span>
      </button>
    );
  }

  // Handle error state or use fallback
  const safeCategories = (categories && categories.length > 0) ? categories : siteConfig.categories;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-gray-700"
        aria-label="Open menu"
      >
        <FaBars className="text-2xl" />
        <span className="hidden sm:inline">Menu</span>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeMenu}
        >
          <div className="min-h-screen px-4 text-left">
            {/* Backdrop */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/30" />
            </Transition.Child>

            {/* Center modal contents */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-x-[-100%]"
              enterTo="opacity-100 scale-100 translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-x-0"
              leaveTo="opacity-0 scale-95 translate-x-[-100%]"
            >
              {/* Make the whole panel clickable to close, except for links */}
              <div
                className="absolute left-0 top-0 inline-block h-full w-full max-w-md transform overflow-hidden bg-white p-6 text-left align-middle shadow-xl transition-all"
                onClick={closeMenu}
                role="presentation"
                tabIndex={-1}
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 cursor-pointer"
                    onClick={closeMenu}
                  >
                    Categories
                  </Dialog.Title>
                  <button
                    onClick={closeMenu}
                    className="rounded-full p-2 hover:bg-gray-100"
                    aria-label="Close menu"
                  >
                    <FaTimes className="text-xl text-gray-600" />
                  </button>
                </div>

                <nav
                  className="mt-6 space-y-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {safeCategories.length > 0 ? (
                    safeCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className="block rounded-lg px-4 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={closeMenu}
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">
                      No categories available
                    </div>
                  )}
                </nav>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default MenuBar;
