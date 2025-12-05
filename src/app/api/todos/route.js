import connectToDatabase from "../../../lib/db";
import Todo from "../../../models/Todo";

export async function GET(req) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 6;
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  try {
    const query = search ? { title: { $regex: search, $options: "i" } } : {};
    const todos = await Todo.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Todo.countDocuments(query);

    return new Response(JSON.stringify({ todos, total }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  await connectToDatabase();
  try {
    const body = await req.json();
    const newTodo = new Todo(body);
    const savedTodo = await newTodo.save();
    return new Response(JSON.stringify(savedTodo), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}

export async function PUT(req) {
  await connectToDatabase();
  try {
    const body = await req.json();
    const updatedTodo = await Todo.findByIdAndUpdate(body.id, body, { new: true, runValidators: true });
    if (!updatedTodo) return new Response(JSON.stringify({ message: "Todo not found" }), { status: 404 });
    return new Response(JSON.stringify(updatedTodo), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}

export async function DELETE(req) {
  await connectToDatabase();
  try {
    const body = await req.json();
    const deletedTodo = await Todo.findByIdAndDelete(body.id);
    if (!deletedTodo) return new Response(JSON.stringify({ message: "Todo not found" }), { status: 404 });
    return new Response(JSON.stringify({ message: "Todo deleted successfully" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
