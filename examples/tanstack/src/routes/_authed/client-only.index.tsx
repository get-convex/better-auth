import { TodoList } from '@/components/TodoListClient'
import { createFileRoute } from '@tanstack/react-router'
import { Authenticated } from 'convex/react'

export const Route = createFileRoute('/_authed/client-only/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Authenticated>
      <TodoList />
    </Authenticated>
  )
}
