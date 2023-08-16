/* src/App.js */
import React, { useEffect, useState } from 'react'
import { Amplify, API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'

// 로그인 추가
import { withAuthenticator, Button, Heading, Text, TextField, View } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';


import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const App = ({ signOut, user }) => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])

  // 렌더가 끝난 이후에 실행
  useEffect(() => {
    console.log('debug1:','Initial state')
    fetchTodos()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
    console.log('debug2:', formState)
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const localTodos = todoData.data.listTodos.items
      setTodos(localTodos)
      console.log('debug3:', todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
      console.log('debug4:', todos)
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  return (
    // amplify ui 버전
    <View style={styles.container}>
      <Heading level={1}>Hello {user.username}</Heading>
      <Button style={styles.button} onClick={signOut}>Sign Out</Button>
      <Heading level={2}>Amplify Todos</Heading>
      <TextField 
        placeholder='Name'
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        defaultValue={formState.name}
      />
      <TextField 
        placeholder='Description'
        onChange={event => setInput('description', event.target.value)}
        style={styles.input}
        defaultValue={formState.description}
      />
      <Button style={styles.button} onClick={addTodo}>Create Todo</Button>
      {
        todos.map((todo, index) => (
          <View key={todo.id ? todo.id : index } style={styles.todo}>
            <Text style={styles.todoName}>{todo.name}</Text>
            <Text style={styles.todoDescription}>{todo.description}</Text>
          </View>
        ))
      }
    </View>
    
    // 구버전 css
    // <div style={styles.container}>
    //   {/* 로그인 구현 */}
    //   <Heading level={1}>Hello {user.username}</Heading>
    //   <Button onClick={signOut}>Sign out</Button>
    //   <h2>Amplify Todos</h2>
    //   <input
    //     onChange={event => setInput('name', event.target.value)}
    //     style={styles.input}
    //     value={formState.name}
    //     placeholder="Name"
    //   />
    //   <input
    //     onChange={event => setInput('description', event.target.value)}
    //     style={styles.input}
    //     value={formState.description}
    //     placeholder="Description"
    //   />
    //   <button style={styles.button} onClick={addTodo}>Create Todo</button>
    //   {
    //     todos.map((todo, index) => (
    //       <div key={todo.id ? todo.id : index} style={styles.todo}>
    //         <p style={styles.todoName}>{todo.name}</p>
    //         <p style={styles.todoDescription}>{todo.description}</p>
    //       </div>
    //     ))
    //   }
    // </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

// 로그인 구현
// export default App
export default withAuthenticator(App);