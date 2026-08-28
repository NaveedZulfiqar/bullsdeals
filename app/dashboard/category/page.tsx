"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Users,
  ArrowUpDown,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "type" | null>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/categories`);
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: "name" | "type") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditType(category.type);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCategory(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      const res = await fetch(`/api/categories/${editingCategory._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, type: editType }),
      });
      if (res.ok) { fetchCategories(); closeEditModal(); }
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const openDeleteModal = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/categories/${deletingId}`, { method: "DELETE" });
      if (res.ok) { fetchCategories(); closeDeleteModal(); }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const filteredAndSortedCategories = [...categories]
    .filter((cat) => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (!sortField) return 0;
      const modifier = sortDirection === "asc" ? 1 : -1;
      return a[sortField].localeCompare(b[sortField]) * modifier;
    });

  return (
    <div className="w-full px-4 py-4">
      {/* Title */}
      <h1 className="text-2xl font-bold text-[#1a2b4b] mb-4">Category</h1>

      {/* Search */}
      <div className="mb-3 max-w-xs">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
        />
      </div>

      {/* Table */}
      <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[24px_1fr_200px_100px] bg-[#edf4fa] px-3 py-2.5 border-b border-gray-200 text-[11px] font-semibold text-[#4e8cb8] uppercase tracking-wider items-center">
          <div />
          <div
            className="flex items-center gap-1 cursor-pointer select-none hover:text-[#3a6e92]"
            onClick={() => handleSort("name")}
          >
            Category Name <ArrowUpDown className="w-3 h-3 opacity-70" />
          </div>
          <div
            className="flex items-center gap-1 cursor-pointer select-none hover:text-[#3a6e92]"
            onClick={() => handleSort("type")}
          >
            Expense/Income <ArrowUpDown className="w-3 h-3 opacity-70" />
          </div>
          <div className="text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="flex flex-col divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-gray-400">Loading categories...</div>
          ) : filteredAndSortedCategories.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No categories found.</div>
          ) : (
            filteredAndSortedCategories.map((category) => (
              <React.Fragment key={category._id}>
                {/* Main Row */}
                <div className="grid grid-cols-[24px_1fr_200px_100px] px-3 py-2.5 items-center hover:bg-gray-50 transition-colors">
                  <div
                    className="flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => toggleExpand(category._id)}
                  >
                    {expandedId === category._id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-sm text-gray-800">{category.name}</div>
                  <div>
                    {category.type === "EXPENSE" ? (
                      <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        EXPENSE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        INCOME
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-3 text-gray-400">
                    <button
                      onClick={() => openEditModal(category)}
                      className="hover:text-blue-600 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(category._id)}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Row */}
                {expandedId === category._id && (
                  <div className="bg-[#fafbfc] px-4 py-3 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#5a7698] font-medium">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        0 accounts under{" "}
                        <span className="font-bold text-[#1a2b4b]">{category.name}</span>
                      </span>
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <div className="grid grid-cols-6 gap-2 bg-[#edf4fa] px-3 py-2 border-b border-gray-200 text-[10px] font-bold text-[#4e8cb8] uppercase tracking-wider text-center">
                        <div className="flex items-center justify-center gap-1">Supplier/Vendor Name <ArrowUpDown className="w-3 h-3 opacity-60" /></div>
                        <div className="flex items-center justify-center gap-1">Address <ArrowUpDown className="w-3 h-3 opacity-60" /></div>
                        <div className="flex items-center justify-center gap-1">City <ArrowUpDown className="w-3 h-3 opacity-60" /></div>
                        <div className="flex items-center justify-center gap-1">Province <ArrowUpDown className="w-3 h-3 opacity-60" /></div>
                        <div className="flex items-center justify-center gap-1">HST# <ArrowUpDown className="w-3 h-3 opacity-60" /></div>
                        <div>Action</div>
                      </div>
                      <div className="py-3 text-center text-xs text-gray-400">No Data available</div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Edit Category</h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as "EXPENSE" | "INCOME")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
            <div className="p-6 flex flex-col gap-3 text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Delete Category</h2>
              <p className="text-sm text-gray-500">Are you sure you want to delete this category? This action cannot be undone.</p>
              <div className="flex justify-center gap-3 mt-2">
                <button type="button" onClick={closeDeleteModal} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer flex-1">Cancel</button>
                <button type="button" onClick={handleDeleteConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer flex-1">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}