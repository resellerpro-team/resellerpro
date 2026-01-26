'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react'
import {
  createTodo,
  toggleTodo,
  deleteTodo,
  createTodoFromSuggestion,
  type Todo,
  type TodoSuggestion,
} from '@/app/(dashboard)/dashboard/todo-actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TodoWidgetProps {
  todos: Todo[]
  suggestions: TodoSuggestion[]
}

type TodoAction =
  | { type: 'add'; payload: Todo }
  | { type: 'toggle'; payload: { id: string; completed: boolean } }
  | { type: 'delete'; payload: string }

export function TodoWidget({ todos: initialTodos, suggestions }: TodoWidgetProps) {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition()
  const [newTodoText, setNewTodoText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSelecting, setIsSelecting] = useState(false)

  // ⚡ OPTIMISTIC UI STATE
  const [optimisticTodos, dispatchOptimistic] = useOptimistic(
    initialTodos,
    (state: Todo[], action: TodoAction) => {
      switch (action.type) {
        case 'add':
          return [action.payload, ...state]
        case 'toggle':
          return state.map((t) =>
            t.id === action.payload.id ? { ...t, completed: action.payload.completed } : t
          )
        case 'delete':
          return state.filter((t) => t.id !== action.payload)
        default:
          return state
      }
    }
  )

  const incompleteTodos = optimisticTodos.filter((t) => !t.completed)
  const completedTodos = optimisticTodos.filter((t) => t.completed)

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoText.trim() || isAdding) return

    const tempId = crypto.randomUUID()
    let text = newTodoText.trim()
    let priority: 'low' | 'medium' | 'high' = 'medium'

    // Smart Shortcut Parsing
    if (text.toLowerCase().includes('#high')) {
      priority = 'high'
      text = text.replace(/#high/gi, '').trim()
    } else if (text.toLowerCase().includes('#low')) {
      priority = 'low'
      text = text.replace(/#low/gi, '').trim()
    } else if (text.toLowerCase().includes('#medium')) {
      priority = 'medium'
      text = text.replace(/#medium/gi, '').trim()
    }

    if (!text) return

    setIsAdding(true)
    setNewTodoText('')

    dispatchOptimistic({
      type: 'add',
      payload: {
        id: tempId,
        text: text,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'optimistic',
        priority: priority,
        is_auto_generated: false,
        source_type: null,
        source_id: null
      }
    })

    const result = await createTodo(text)

    if (result.success) {
      toast.success('Task added!')
      startTransition(() => {
        router.refresh()
      })
    } else {
      toast.error(result.error || 'Failed to add task')
      router.refresh()
    }
    setIsAdding(false)
  }

  const handleToggleTodo = async (id: string, completed: boolean) => {
    dispatchOptimistic({ type: 'toggle', payload: { id, completed: !completed } })

    const result = await toggleTodo(id, !completed)

    if (result.success) {
      toast.success(completed ? 'Task reopened' : 'Task completed! 🎉', {
        action: {
          label: 'Undo',
          onClick: () => handleToggleTodo(id, !completed),
        },
      })
    } else {
      toast.error(result.error || 'Failed to update task')
      router.refresh()
    }
  }

  const handleDeleteTodo = async (todo: Todo) => {
    dispatchOptimistic({ type: 'delete', payload: todo.id })

    const result = await deleteTodo(todo.id)

    if (result.success) {
      toast.success('Task deleted', {
        action: {
          label: 'Undo',
          onClick: async () => {
            const res = await createTodo(todo.text)
            if (res.success) {
              toast.success('Task restored')
              router.refresh()
            }
          },
        },
      })
      startTransition(() => {
        router.refresh()
      })
    } else {
      toast.error(result.error || 'Failed to delete task')
      router.refresh()
    }
  }

  const handleAddSuggestion = async (suggestion: TodoSuggestion) => {
    const tempId = crypto.randomUUID()
    dispatchOptimistic({
      type: 'add',
      payload: {
        id: tempId,
        text: suggestion.text,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'optimistic',
        priority: suggestion.priority,
        is_auto_generated: true,
        source_type: suggestion.source_type,
        source_id: suggestion.source_id
      }
    })

    const result = await createTodoFromSuggestion(
      suggestion.text,
      suggestion.source_type,
      suggestion.source_id,
      suggestion.priority
    )

    if (result.success) {
      toast.success('Added to your tasks!')
      startTransition(() => {
        router.refresh()
      })
    } else {
      toast.error(result.error || 'Failed to add task')
      router.refresh()
    }
  }

  const handleBulkComplete = async () => {
    if (selectedIds.length === 0) return
    const ids = [...selectedIds]
    setSelectedIds([])
    setIsSelecting(false)

    for (const id of ids) {
      const todo = optimisticTodos.find(t => t.id === id)
      if (todo && !todo.completed) {
        dispatchOptimistic({ type: 'toggle', payload: { id, completed: true } })
        await toggleTodo(id, true)
      }
    }

    toast.success(`${ids.length} task${ids.length > 1 ? 's' : ''} completed!`)
    router.refresh()
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    const ids = [...selectedIds]
    const todos = optimisticTodos.filter(t => ids.includes(t.id))
    setSelectedIds([])
    setIsSelecting(false)

    ids.forEach(id => dispatchOptimistic({ type: 'delete', payload: id }))

    for (const id of ids) {
      await deleteTodo(id)
    }

    toast.success(`${ids.length} task${ids.length > 1 ? 's' : ''} deleted`, {
      action: {
        label: 'Undo',
        onClick: async () => {
          for (const todo of todos) {
            await createTodo(todo.text)
          }
          toast.success('Tasks restored')
          router.refresh()
        },
      },
    })
    router.refresh()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 dark:text-red-400'
      case 'medium':
        return 'text-yellow-500 dark:text-yellow-400'
      case 'low':
        return 'text-blue-500 dark:text-blue-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500'
      case 'medium': return 'border-l-4 border-l-yellow-500'
      case 'low': return 'border-l-4 border-l-blue-500'
      default: return 'border-l-4 border-l-transparent'
    }
  }

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'order':
        return ShoppingCart
      case 'product':
        return Package
      case 'customer':
        return Users
      default:
        return AlertCircle
    }
  }

  return (
    <Card className="flex flex-col h-[500px] shadow-lg border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Daily Tasks</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] px-2"
              onClick={() => {
                setIsSelecting(!isSelecting)
                setSelectedIds([])
              }}
            >
              {isSelecting ? 'Cancel' : 'Select'}
            </Button>
            <Badge variant="secondary" className="text-xs">
              {incompleteTodos.length} active
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          Stay on top of your daily work. <span className="text-muted-foreground/60 italic font-mono">#high #medium #low</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pb-4 overflow-hidden">
        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            className="flex-1 h-9 text-sm"
            disabled={isAdding}
          />
          <Button
            type="submit"
            size="sm"
            className="h-9 px-3"
            disabled={isAdding || !newTodoText.trim()}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </form>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-primary/10 border border-primary/20 rounded-md">
            <span className="text-xs font-bold text-primary">{selectedIds.length} selected</span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-[10px] px-2 hover:bg-green-500/10 hover:text-green-600"
                onClick={handleBulkComplete}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-[10px] px-2 hover:bg-destructive/10 hover:text-destructive"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Todos List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3">
            {incompleteTodos.length === 0 && completedTodos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Circle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">No tasks yet</p>
                <p className="text-xs mt-1">Add your first task above</p>
              </div>
            ) : (
              <>
                {/* Incomplete Todos */}
                {incompleteTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggleTodo}
                    onDelete={() => handleDeleteTodo(todo)}
                    getPriorityColor={getPriorityColor}
                    getPriorityBorder={getPriorityBorder}
                    isSelecting={isSelecting}
                    isSelected={selectedIds.includes(todo.id)}
                    onSelect={toggleSelect}
                  />
                ))}

                {/* Completed Todos */}
                {completedTodos.length > 0 && (
                  <div className="pt-3 mt-3 border-t">
                    <button
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 group"
                    >
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed ({completedTodos.length})
                      </span>
                      {showCompleted ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {showCompleted && (
                      <div className="space-y-2 animate-fade-in">
                        {completedTodos.map((todo) => (
                          <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={handleToggleTodo}
                            onDelete={() => handleDeleteTodo(todo)}
                            getPriorityColor={getPriorityColor}
                            getPriorityBorder={getPriorityBorder}
                            isSelecting={isSelecting}
                            isSelected={selectedIds.includes(todo.id)}
                            onSelect={toggleSelect}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Suggestions Section */}
        {suggestions.length > 0 && (
          <div className="border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="w-full justify-between h-8 px-2 mb-2 hover:bg-primary/5"
            >
              <span className="flex items-center gap-2 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Smart Suggestions ({suggestions.length})
              </span>
              {showSuggestions ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>

            {showSuggestions && (
              <ScrollArea className="max-h-[150px]">
                <div className="space-y-2 animate-fade-in pr-4">
                  {suggestions.map((suggestion) => {
                    const SourceIcon = getSourceIcon(suggestion.source_type)
                    return (
                      <div
                        key={suggestion.id}
                        className="flex items-start gap-2 p-2 rounded-md bg-primary/5 border border-primary/10 group hover:bg-primary/10 transition-colors"
                      >
                        <SourceIcon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${getPriorityColor(suggestion.priority)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-tight">
                            {suggestion.text}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-[10px] h-4 px-1 mt-1 ${getPriorityColor(suggestion.priority)}`}
                          >
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddSuggestion(suggestion)}
                          className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  getPriorityColor,
  getPriorityBorder,
  isSelecting,
  isSelected,
  onSelect,
}: {
  todo: Todo
  onToggle: (id: string, completed: boolean) => void
  onDelete: () => void
  getPriorityColor: (priority: string) => string
  getPriorityBorder: (priority: string) => string
  isSelecting: boolean
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete()
  }

  return (
    <div
      onClick={() => isSelecting && onSelect(todo.id)}
      className={`group flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-all ${getPriorityBorder(todo.priority)} ${todo.completed ? 'opacity-60' : ''
        } ${isSelected ? 'bg-primary/5 border-primary/20' : ''} ${isDeleting ? 'opacity-50 pointer-events-none' : ''
        } ${isSelecting ? 'cursor-pointer select-none' : ''}`}
    >
      {isSelecting ? (
        <div className="mt-1 flex-shrink-0">
          <div
            className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
              }`}
          >
            {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
          </div>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle(todo.id, todo.completed)
          }}
          className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
          )}
        </button>
      )}

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-tight ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
        >
          {todo.text}
        </p>
        {todo.is_auto_generated && (
          <Badge variant="outline" className="text-[10px] h-4 px-1 mt-1">
            <Sparkles className="h-2.5 w-2.5 mr-0.5" />
            Auto
          </Badge>
        )}
      </div>

      {!isSelecting && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete task"
        >
          {isDeleting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  )
}
