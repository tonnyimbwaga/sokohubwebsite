"use client";

import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { LuFilter, LuX } from "react-icons/lu";
import SidebarFilters from "../SideBarFilter";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface MobileFiltersProps {
    categories: Category[];
    activeCategory?: string;
}

const MobileFilters = ({ categories, activeCategory }: MobileFiltersProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <>
            <button
                onClick={openModal}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
                <LuFilter className="text-lg" />
                Filters
            </button>

            <Transition show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40 bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-end p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300 sm:duration-500"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300 sm:duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden bg-white p-6 shadow-xl transition-all h-screen">
                                    <div className="flex items-center justify-between mb-8">
                                        <Dialog.Title as="h3" className="text-2xl font-semibold text-gray-900">
                                            Filters
                                        </Dialog.Title>
                                        <button
                                            type="button"
                                            className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                            onClick={closeModal}
                                        >
                                            <LuX className="text-2xl" />
                                        </button>
                                    </div>

                                    <div className="mt-2 h-[calc(100vh-120px)] overflow-y-auto">
                                        <SidebarFilters categories={categories} activeCategory={activeCategory} />
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default MobileFilters;
