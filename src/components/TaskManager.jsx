import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  RotateCcw
} from 'lucide-react';

export default function TaskManager({ tasks, setTasks, clients, staff, currentUser }) {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    clientId: clients[0]?.id || '',
    category: 'GST',
    assignedTo: staff[2]?.id || 'U3',
    priority: 'High',
    dueDate: '2026-08-25',
    description: ''
  });

  const canCreateOrAssign = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  const handleCreateTask = (e) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === newTask.clientId);
    const assignee = staff.find((s) => s.id === newTask.assignedTo);
    const created = {
      ...newTask,
      id: `TSK-${Date.now()}`,
      clientName: client ? client.name : 'General Work',
      assignedToName: assignee ? assignee.name : 'Staff Member',
      status: 'To Do'
    };
    setTasks([created, ...tasks]);
    setShowNewTaskModal(false);
    setNewTask({
      title: '',
      clientId: clients[0]?.id || '',
      category: 'GST',
      assignedTo: staff[2]?.id || 'U3',
      priority: 'High',
      dueDate: '2026-08-25',
      description: ''
    });
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  const handleToggleTaskCompletion = (taskId) => {
    setTasks(tasks.map((t) => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'Completed' ? 'In Progress' : 'Completed';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const columns = ['To Do', 'In Progress', 'Review', 'Completed'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            {currentUser.role === 'NORMAL_USER' ? 'My Allocated Tasks & Work Control' : 'Staff Work Allocation & Task Delegation'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser.role === 'NORMAL_USER'
              ? 'View tasks allocated to you. Mark task complete when finished or reverse if needed.'
              : 'Assign statutory tasks to article assistants, mark due dates, and monitor real-time completion.'}
          </p>
        </div>

        {canCreateOrAssign && (
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Delegate New Task</span>
          </button>
        )}
      </div>

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          return (
            <div key={col} className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex flex-col min-h-[450px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold uppercase text-slate-300 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    col === 'To Do' ? 'bg-amber-400' :
                    col === 'In Progress' ? 'bg-blue-400' :
                    col === 'Review' ? 'bg-purple-400' : 'bg-emerald-400'
                  }`}></span>
                  {col}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-slate-600 transition space-y-2.5 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-100 leading-snug">{t.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                        t.priority === 'Urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                        t.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {t.priority}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {t.description || 'No description provided.'}
                    </p>

                    <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-medium truncate max-w-[120px]">{t.clientName}</span>
                      <span className="text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {t.dueDate}
                      </span>
                    </div>

                    {/* Action Controls & Reversal Button */}
                    <div className="pt-2 flex items-center justify-between gap-1 text-[11px]">
                      <span className="text-emerald-400 font-semibold font-mono truncate max-w-[110px]">
                        Assigned: {t.assignedToName || t.assignedTo}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleTaskCompletion(t.id)}
                          className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                            t.status === 'Completed'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          }`}
                          title={t.status === 'Completed' ? 'Reverse Task back to In Progress' : 'Mark Task Completed'}
                        >
                          {t.status === 'Completed' ? (
                            <>
                              <RotateCcw className="w-3 h-3" />
                              <span>Reverse</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Complete</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                Delegate Task & Set Completion Date
              </h3>
              <button onClick={() => setShowNewTaskModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Verify GSTR-2B ITC for July"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Client</label>
                  <select
                    value={newTask.clientId}
                    onChange={(e) => setNewTask({ ...newTask, clientId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="GST">GST Compliance</option>
                    <option value="Income Tax">Income Tax Return</option>
                    <option value="Tax Audit">Tax Audit (3CD)</option>
                    <option value="ROC">ROC Filing</option>
                    <option value="Statutory Audit">Statutory Audit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assign User</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.designation})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Completion Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Detailed instructions for article assistant..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg"
                >
                  Create & Delegate Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
