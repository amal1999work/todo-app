"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, Edit3, CheckCircle, Clock, AlertCircle, Calendar, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import GlassCard from "../components/GlassCard/GlassCard";
import StatCard from "../components/StatCard/StatCard";
import ModernLoader from "../components/ModernLoader/ModernLoader";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [totalTodos, setTotalTodos] = useState(0);
  const [stats, setStats] = useState({ pending: 0, progress: 0, completed: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => { fetchTodos(currentPage); }, [currentPage]);

  useEffect(() => {
    const pending = todos.filter(t => t.status === 'Pending').length;
    const progress = todos.filter(t => t.status === 'In-Progress').length;
    const completed = todos.filter(t => t.status === 'Completed').length;
    setStats({ pending, progress, completed });
  }, [todos]);

  const fetchTodos = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/todos?page=${page}&limit=${itemsPerPage}`);
      setTodos(res.data.todos);
      setTotalTodos(res.data.total);
    } catch { toast.error("Failed to fetch todos"); } 
    finally { setLoading(false); }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete("/api/todos", { data: { id } });
      setTodos(prev => prev.filter(t => t._id !== id));
      setTotalTodos(prev => prev - 1);
      toast.success("Task deleted!");
      if (todos.length === 1 && currentPage > 1) setCurrentPage(prev => prev - 1);
    } catch { toast.error("Error deleting task"); }
  };

  const openEditModal = (todo) => {
    setEditId(todo._id);
    setValue("title", todo.title);
    setValue("description", todo.description);
    setValue("status", todo.status);
    setIsModalOpen(true);
  };

  const closeModal = () => { reset(); setEditId(null); setIsModalOpen(false); };

  const onSubmit = async (data) => {
    try {
      if (editId) {
        const res = await axios.put("/api/todos", { ...data, id: editId });
        setTodos(prev => prev.map(t => t._id === editId ? res.data : t));
        toast.success("Task updated!");
      } else {
        const res = await axios.post("/api/todos", data);
        setTodos(prev => [res.data, ...prev]);
        setTotalTodos(prev => prev + 1);
        toast.success("New task created!");
      }
      closeModal();
    } catch { toast.error("Something went wrong"); }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      case "In-Progress": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const filteredTodos = todos.filter(todo => todo.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 font-sans text-gray-800">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8">
      
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">ToDo App</h1>
          <button onClick={() => setIsModalOpen(true)} className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1">
            <Plus size={20} /> Create New Task
          </button>
        </div>

       
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Tasks" count={totalTodos} icon={Calendar} color="bg-indigo-500" />
          <StatCard title="Pending" count={stats.pending} icon={Clock} color="bg-yellow-500" />
          <StatCard title="In Progress" count={stats.progress} icon={AlertCircle} color="bg-blue-500" />
          <StatCard title="Completed" count={stats.completed} icon={CheckCircle} color="bg-green-500" />
        </div>

        
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-700">Recent Tasks</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search tasks..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {loading ? <ModernLoader /> : (
            <>
              {filteredTodos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Calendar size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-500">No tasks found</h3>
                  <p className="text-gray-400 text-sm">Create a new task to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredTodos.map(todo => (
                      <motion.div key={todo._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${todo.status === 'Completed' ? 'bg-green-500' : todo.status === 'In-Progress' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(todo.status)}`}>{todo.status}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(todo)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"><Edit3 size={16} /></button>
                            <button onClick={() => deleteTodo(todo._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={16} /></button>
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">{todo.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 min-h-[40px]">{todo.description || "No description provided."}</p>
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                          <span>ID: #{todo._id.slice(-4)}</span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <div className="mt-8 flex justify-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">Previous</button>
                <span className="px-4 py-2 text-gray-600 font-medium bg-white rounded-lg border border-gray-200">Page {currentPage}</span>
                <button disabled={currentPage * itemsPerPage >= totalTodos} onClick={() => setCurrentPage(c => c + 1)} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            </>
          )}
        </GlassCard>
      </div>

   
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800">{editId ? "Edit Task" : "Create New Task"}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input {...register("title", { required: "Title is required" })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Design System" />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea {...register("description")} rows="3" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Add details..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select {...register("status")} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="Pending">Pending</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all">{editId ? "Save Changes" : "Create Task"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
