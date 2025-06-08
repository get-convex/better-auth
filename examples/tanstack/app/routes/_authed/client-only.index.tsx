import { TodoList } from '@/components/TodoListClient'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/client-only/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TodoList />
}
