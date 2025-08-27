import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { UpdateTodoRq } from "@/requests/todos/updateTodo/UpdateTodoRq";
import { UpdateTodoRs } from "@/requests/todos/updateTodo/UpdateTodoRs";
import { DeleteTodoRs } from "@/requests/todos/deleteTodo/DeleteTodoRs";
import { Todo } from "@/requests/todos/readTodo/ReadTodoRs";

const TABLE = "todos";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const payload = (await req.json()) as UpdateTodoRq;
  const supabase = getSupabaseServer();
  const update: {
    title?: string;
    completed?: boolean;
    priority?: string;
    due_at?: string;
  } = {};
  if (typeof payload.title === "string") update.title = payload.title;
  if (typeof payload.completed === "boolean")
    update.completed = payload.completed;
  if (typeof payload.priority === "string") update.priority = payload.priority;
  if (typeof payload.dueAt === "number")
    update.due_at = new Date(payload.dueAt).toISOString();

  const { data, error } = await supabase
    .from(TABLE)
    .update(update)
    .eq("id", id)
    .select("id, title, completed, created_at, due_at, priority")
    .single();
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });

  const item: Todo = {
    id: String(data!.id),
    title: data!.title,
    completed: !!data!.completed,
    createdAt: data!.created_at
      ? new Date(data!.created_at).getTime()
      : Date.now(),
    dueAt: data!.due_at ? new Date(data!.due_at).getTime() : Date.now(),
    priority: (data!.priority as Todo["priority"]) ?? "medium",
  };
  const body: UpdateTodoRs = { item };
  return NextResponse.json(body);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const supabase = getSupabaseServer();
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });
  const body: DeleteTodoRs = { ok: true };
  return NextResponse.json(body);
}
