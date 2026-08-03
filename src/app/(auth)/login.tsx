import { Text } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/screen-wrapper'

export default function login() {
  return (
    <ScreenWrapper className="justify-center items-center">
      <Text className="text-lg font-urbanist-bold text-gray-800">Login Screen</Text>
    </ScreenWrapper>
  )
}