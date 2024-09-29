import { serve } from '@hono/node-server'
import { PrismaClient } from '@prisma/client';
import { Hono } from 'hono'
import Home from './pages/Home';
import TodoItem from './components/TodoItem';

const app = new Hono()
const prisma = new PrismaClient();

app.get('/', (c) => {
  return c.html(<Home/>);
});

app.get('/api/todos', async (c) => {
  const results = await prisma.demo.findMany({
    select:{
      id:true,
      content: true,
      timestamp: true
    }
  })
  console.log(results);
  
  return c.html(
    <>
      {results.map(todo => <TodoItem {...todo} />)}
    </>,
  );
});

app.post('/api/todo', async (c) => {
  const { content } = await c.req.json();
  
  try {
    const result = await prisma.demo.create({
      data: {
        content: content
      }
    });
    
    return c.html(<TodoItem {...result} />);

  } catch (error) {
    console.error(error);
    return c.html(<></>); // Handle error response
  }
});

// DELETE /api/todo
app.delete('/api/todo', async (c) => {
  const { todoId } = await c.req.json();
  
  try {
    await prisma.demo.delete({
      where: {
        id: Number(todoId)
      }
    });
    
    return c.body('✔', 200, {
      'HX-Trigger': 'todo-delete',
    });
    
  } catch (error) {
    console.error(error);
    return c.html(<></>); // Handle error response
  }
});

const port = 3002
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
