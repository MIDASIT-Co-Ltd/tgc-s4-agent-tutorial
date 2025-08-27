import useUpdateTodoMutation from "@/requests/todos/updateTodo/useUpdateTodoMutation";
import { useCallback, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

const TodoListInAgent = ({
  todos: _todos,
}: {
  todos: { id: string; title: string; completed: boolean }[];
}) => {
  const updateMutation = useUpdateTodoMutation();

  const [todos, setTodos] = useState(_todos);

  const toggleTodo = useCallback(
    (id: string) => {
      const current = todos.find((t) => t.id === id);
      if (!current) return;
      updateMutation.mutate({ id, patch: { completed: !current.completed } });
      setTodos(
        todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    },
    [todos]
  );

  return (
    <Table>
      <TableBody>
        {todos.map((todo) => (
          <TableRow
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            className="cursor-pointer"
          >
            <TableCell className="w-0">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
              />
            </TableCell>
            <TableCell>{todo.title}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span>{todo.title}</span>
        </li>
      ))}
    </ul>
  );
};

export default TodoListInAgent;
