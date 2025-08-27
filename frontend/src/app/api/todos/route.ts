import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { CreateTodoRq } from "@/requests/todos/createTodo/CreateTodoRq";
import { CreateTodoRs } from "@/requests/todos/createTodo/CreateTodoRs";
import { GetTodosRs, Todo } from "@/requests/todos/readTodo/ReadTodoRs";

const TABLE = "todos";

export async function GET(req: Request) {
  const supabase = getSupabaseServer();
  const url = new URL(req.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");

  let query = supabase
    .from(TABLE)
    .select("id, title, completed, created_at, due_at, priority")
    .order("due_at", { ascending: true })
    .order("created_at", { ascending: true });

  if (start) {
    query = query.gte("due_at", new Date(start).toISOString());
  }
  if (end) {
    query = query.lte("due_at", new Date(end).toISOString());
  }

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });

  type Row = {
    id: string | number;
    title: string;
    completed: boolean | null;
    created_at: string | null;
    due_at: string | null;
    priority: string | null;
  };
  const items: Todo[] = (data ?? []).map((row: Row) => ({
    id: String(row.id),
    title: row.title,
    completed: !!row.completed,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    dueAt: row.due_at ? new Date(row.due_at).getTime() : Date.now(),
    priority: (row.priority as Todo["priority"]) ?? "medium",
  }));
  const body: GetTodosRs = { items };
  return NextResponse.json(body);
}

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  const { title, date, priority } = (await req.json()) as CreateTodoRq;
  const dateTime = new Date(date).toISOString();
  const insert = {
    title,
    priority,
    due_at: dateTime,
    completed: false,
  };
  if (!insert.title) {
    return NextResponse.json({ message: "title is required" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from(TABLE)
    .insert(insert)
    .select("id, title, completed, created_at, due_at, priority")
    .single();
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });

  const item: Todo = {
    id: String(data!.id),
    title: data!.title,
    completed: !!data!.completed,
    createdAt: Date.now(),
    dueAt: data!.due_at ? new Date(data!.due_at).getTime() : Date.now(),
    priority: (data!.priority as Todo["priority"]) ?? "medium",
  };
  const body: CreateTodoRs = { item };
  return NextResponse.json(body, { status: 201 });
}
