import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

type Priority = 'Low' | 'Medium' | 'High'
type Task = {
  id: string
  title: string
  notes: string
  category: string
  priority: Priority
  dueDate: string
  completed: boolean
  createdAt: number
}

type TaskDraft = Omit<Task, 'id' | 'completed' | 'createdAt'>

const categories = ['Work', 'Personal', 'Learning', 'Health']
const storageKey = 'daymark.tasks.v1'

function localDateString(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function dateOffset(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return localDateString(date)
}

function starterTasks(): Task[] {
  return [
    { id: 'sample-1', title: 'Send the project proposal', notes: 'Include the revised timeline and budget.', category: 'Work', priority: 'High', dueDate: dateOffset(0), completed: false, createdAt: 3 },
    { id: 'sample-2', title: 'Pick up a few groceries', notes: '', category: 'Personal', priority: 'Low', dueDate: dateOffset(0), completed: false, createdAt: 2 },
    { id: 'sample-3', title: 'Read a chapter of your book', notes: 'Twenty quiet minutes before bed.', category: 'Learning', priority: 'Medium', dueDate: dateOffset(1), completed: false, createdAt: 1 },
    { id: 'sample-4', title: 'Book a dentist appointment', notes: '', category: 'Health', priority: 'Medium', dueDate: dateOffset(3), completed: true, createdAt: 0 },
  ]
}

function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) as Task[] : starterTasks()
    } catch {
      return starterTasks()
    }
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks))
  }, [tasks])

  return [tasks, setTasks] as const
}

function formatDate(value: string) {
  if (!value) return 'No date'
  const date = new Date(`${value}T12:00:00`)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const sameDay = (first: Date, second: Date) => first.toDateString() === second.toDateString()
  if (sameDay(date, today)) return 'Today'
  if (sameDay(date, tomorrow)) return 'Tomorrow'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}

function TaskRow({ task, onToggle, onEdit, onDelete }: {
  task: Task
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className={`task-row${task.completed ? ' is-complete' : ''}`}>
      <button className="check-button" type="button" aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'} onClick={onToggle}>
        {task.completed && <span>✓</span>}
      </button>
      <div className="task-copy">
        <button className="task-title" type="button" onClick={onEdit}>{task.title}</button>
        {task.notes && <p className="task-notes">{task.notes}</p>}
        <div className="task-meta">
          <span className={`category-dot category-${task.category.toLowerCase()}`}>{task.category}</span>
          <span className={`priority priority-${task.priority.toLowerCase()}`}><i />{task.priority}</span>
          <span className={`due-date${!task.completed && task.dueDate < new Date().toISOString().slice(0, 10) ? ' overdue' : ''}`}>{formatDate(task.dueDate)}</span>
        </div>
      </div>
      <div className="task-actions">
        <button type="button" aria-label={`Edit ${task.title}`} title="Edit task" onClick={onEdit}>✎</button>
        <button type="button" aria-label={`Delete ${task.title}`} title="Delete task" onClick={onDelete}>×</button>
      </div>
    </article>
  )
}

function TaskDialog({ task, onClose, onSave }: {
  task: Task | null
  onClose: () => void
  onSave: (draft: TaskDraft) => void
}) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [category, setCategory] = useState(task?.category ?? categories[0])
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'Medium')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? dateOffset(0))

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ title: title.trim(), notes: notes.trim(), category, priority, dueDate })
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <form className="task-dialog" onSubmit={submit}>
        <div className="dialog-heading">
          <div><span className="eyebrow">A LITTLE AT A TIME</span><h2>{task ? 'Edit task' : 'Make a task'}</h2></div>
          <button className="close-button" type="button" aria-label="Close dialog" onClick={onClose}>×</button>
        </div>
        <label className="field-label">Task name<input autoFocus required maxLength={100} placeholder="What needs doing?" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="field-label">A note, if you need one<textarea rows={3} maxLength={300} placeholder="Add a little context..." value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        <div className="form-grid">
          <label className="field-label">Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field-label">Priority<select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}><option>Low</option><option>Medium</option><option>High</option></select></label>
        </div>
        <label className="field-label">Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
        <div className="dialog-footer"><button className="text-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{task ? 'Save changes' : 'Add task'} <span>↗</span></button></div>
      </form>
    </div>
  )
}

function App() {
  const [tasks, setTasks] = useTasks()
  const [view, setView] = useState('All tasks')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [sortBy, setSortBy] = useState('due')
  const [search, setSearch] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined)

  const today = localDateString()
  const activeTasks = tasks.filter((task) => !task.completed)
  const filteredTasks = tasks.filter((task) => {
    if (view === 'Completed' ? !task.completed : task.completed) return false
    if (view === 'Today' && task.dueDate !== today) return false
    if (view === 'Upcoming' && (!task.dueDate || task.dueDate <= today)) return false
    if (categoryFilter !== 'All categories' && task.category !== categoryFilter) return false
    if (priorityFilter !== 'All priorities' && task.priority !== priorityFilter) return false
    return `${task.title} ${task.notes}`.toLowerCase().includes(search.toLowerCase())
  }).sort((first, second) => {
    if (sortBy === 'priority') return ['High', 'Medium', 'Low'].indexOf(first.priority) - ['High', 'Medium', 'Low'].indexOf(second.priority)
    if (sortBy === 'created') return second.createdAt - first.createdAt
    return (first.dueDate || '9999').localeCompare(second.dueDate || '9999')
  })

  const counts: Record<string, number> = {
    'All tasks': activeTasks.length,
    Today: activeTasks.filter((task) => task.dueDate === today).length,
    Upcoming: activeTasks.filter((task) => task.dueDate > today).length,
    Completed: tasks.filter((task) => task.completed).length,
  }

  function saveTask(draft: TaskDraft) {
    if (editingTask) {
      setTasks((current) => current.map((task) => task.id === editingTask.id ? { ...task, ...draft } : task))
    } else {
      setTasks((current) => [{ ...draft, id: crypto.randomUUID(), completed: false, createdAt: Date.now() }, ...current])
    }
    setEditingTask(undefined)
  }

  function deleteTask(task: Task) {
    if (window.confirm(`Delete “${task.title}”?`)) setTasks((current) => current.filter((item) => item.id !== task.id))
  }

  const todayLabel = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#all" onClick={(event) => { event.preventDefault(); setView('All tasks') }}><span className="brand-mark">!</span><span>Quest Tracker</span></a>
        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="main-nav" aria-label="Task views">
          {['All tasks', 'Today', 'Upcoming', 'Completed'].map((item, index) => <button key={item} className={`nav-item${view === item ? ' selected' : ''}`} onClick={() => setView(item)}><span className={`nav-symbol symbol-${index}`}>{['▦', '◷', '↗', '✓'][index]}</span><span>{item}</span><span className="nav-count">{counts[item]}</span></button>)}
        </nav>
        <div className="sidebar-label category-heading">CATEGORIES</div>
        <nav className="category-nav" aria-label="Filter by category">
          {categories.map((category) => <button key={category} className={`category-link${categoryFilter === category ? ' active' : ''}`} onClick={() => { setCategoryFilter(categoryFilter === category ? 'All categories' : category); setView('All tasks') }}><span className={`category-mark category-${category.toLowerCase()}`} />{category}<span className="category-count">{tasks.filter((task) => task.category === category && !task.completed).length}</span></button>)}
        </nav>
        <div className="sidebar-bottom"><div className="week-note"><span className="sun-mark">✳</span><p>Small steps<br />still move you forward.</p></div><span className="local-note"><span /> Saved on this device</span></div>
      </aside>

      <main className="main-panel">
        <header className="topbar"><span className="top-date">{todayLabel}</span><span className="topbar-right"><span className="local-status"><i /> Local workspace</span><span className="avatar">D</span></span></header>
        <section className="content-area">
          <div className="page-heading"><div><span className="eyebrow">EVERY QUEST STARTS WITH A NEXT STEP</span><h1>{view === 'All tasks' ? 'Take command of the day.' : view}</h1><p className="heading-subtitle">{view === 'Today' ? 'Focus on what matters right now.' : view === 'Upcoming' ? 'Prepare for what’s coming next.' : view === 'Completed' ? 'Celebrate the wins you’ve already earned.' : 'Make room for what matters.'}</p></div><button className="primary-button new-task-button" onClick={() => setEditingTask(null)}><span className="plus-icon">+</span> New task</button></div>

          <div className="focus-strip"><div className="focus-icon">✳</div><div><span className="focus-label">YOUR FOCUS</span><p>{activeTasks.length === 0 ? 'Everything is done. Take a breath.' : <><strong>{activeTasks.filter((task) => task.dueDate === today).length} things</strong> on your plate today. One at a time.</>}</p></div><div className="focus-progress"><span>{tasks.filter((task) => task.completed).length} / {tasks.length}</span><div className="progress-track"><i style={{ width: `${tasks.length ? tasks.filter((task) => task.completed).length / tasks.length * 100 : 0}%` }} /></div></div></div>

          <div className="list-heading"><div><h2>{view === 'All tasks' ? 'Your tasks' : view}</h2><span>{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}</span></div><div className="list-controls"><label className="search-box"><span>⌕</span><input aria-label="Search tasks" placeholder="Find a task" value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>/</kbd></label><select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select><select aria-label="Sort tasks" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="due">Due date</option><option value="priority">Priority</option><option value="created">Recently added</option></select></div></div>

          {filteredTasks.length > 0 ? <div className="task-list">{filteredTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} onEdit={() => setEditingTask(task)} onDelete={() => deleteTask(task)} />)}</div> : <div className="empty-state"><span className="empty-mark">✳</span><h3>{search || categoryFilter !== 'All categories' || priorityFilter !== 'All priorities' ? 'Nothing matches just yet.' : 'A little room to breathe.'}</h3><p>{search || categoryFilter !== 'All categories' || priorityFilter !== 'All priorities' ? 'Try a different search or filter.' : 'Add a task whenever something comes to mind.'}</p>{!search && <button className="text-button" onClick={() => setEditingTask(null)}>+ Add your first task</button>}</div>}

          <button className="add-task-row" onClick={() => setEditingTask(null)}><span>+</span> Add a task</button>
          <footer className="page-footer"><span>Make a little progress, then call it a day.</span><span>QUEST TRACKER · YOUR OWN PACE</span></footer>
        </section>
      </main>
      {editingTask !== undefined && <TaskDialog task={editingTask} onClose={() => setEditingTask(undefined)} onSave={saveTask} />}
    </div>
  )
}

export default App
