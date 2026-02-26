import React, { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import './index.css'

const Index = () => {
  const [count, setCount] = useState(0)

  const add = () => {
    setCount(count + 1)
  }

  return (
    <View className='index'>
      <Text className='title'>RetailAI Store</Text>
      <Text className='count'>当前计数：{count}</Text>
      <Button onClick={add}>点击加 1</Button>
    </View>
  )
}

export default Index
