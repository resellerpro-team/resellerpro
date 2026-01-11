'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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

export function TodoWidget({ todos: initialTodos, suggestions }: TodoWidgetProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [newTodoText, setNewTodoText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const incompleteTodos = initialTodos.filter((t) => !t.completed)
  const completedTodos = initialTodos.filter((t) => t.completed)

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoText.trim() || isAdding) return

    setIsAdding(true)
    const result = await createTodo(newTodoText)
    
    if (result.success) {
      setNewTodoText('')
      toast.success('Task added!')
      startTransition(() => {
        router.refresh()
      })
    } else {
      toast.error(result.error || 'Failed to add task')
    }
    setIsAdding(false)
  }

  const handleToggleTodo = async (id: string, completed: boolean) => {
    const result = await toggleTodo(id, !completed)
    
    if (result.success) {
      toast.success(completed ? 'Task reopened' : 'Task completed! 🎉')
      startTransition(() => {
        router.refresh()
      })
    } else {
      toast.error(result.error || 'Failed to update task')
    }
  }

  const handleDeleteTodo = async (id: string) => {
    const result = await deleteTodo(id)
    
    if (result.success) {
      toast.success('Task deleted')
      startTransition(() => {
        router.refresh()
      })
    } else {
      toast.error(result.error || 'Failed to delete task')
    }
  }

  const handleAddSuggestion = async (suggestion: TodoSuggestion) => {
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
    }
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
    <Card className="h-full flex flex-col shadow-lg border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Daily Tasks</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {incompleteTodos.length} active
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Stay on top of your daily work
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pb-4">
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
                    onDelete={handleDeleteTodo}
                    getPriorityColor={getPriorityColor}
                  />
                ))}

                {/* Completed Todos */}
                {completedTodos.length > 0 && (
                  <div className="pt-3 mt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed ({completedTodos.length})
                    </p>
                    {completedTodos.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggleTodo}
                        onDelete={handleDeleteTodo}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Suggestions Section */}
        {suggestions.length > 0 && (
          <div className="border-t pt-3 mt-2">
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
              <ScrollArea className="max-h-[200px]">
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
}: {
  todo: Todo
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  getPriorityColor: (priority: string) => string
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(todo.id)
  }

  return (
    <div
      className={`group flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-all ${
        todo.completed ? 'opacity-60' : ''
      } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <button
        onClick={() => onToggle(todo.id, todo.completed)}
        className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
      >
        {todo.completed ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-tight ${
            todo.completed
              ? 'line-through text-muted-foreground'
              : 'text-foreground'
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

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
      >
        {isDeleting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
      </Button>
    </div>
  )
}
