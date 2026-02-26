import React, { useState } from 'react'
import './index.css'

const Index = () => {
  const [count, setCount] = useState(0)

  const add = () => {
    setCount(count + 1)
  }

  return (
    <div className='index'>
      <h1 className='title'>RetailAI Store H5</h1>
      <p className='count'>当前计数：{count}</p>
      <button className='button' onClick={add}>点击加 1</button>
    </div>
  )
}

export default Index
